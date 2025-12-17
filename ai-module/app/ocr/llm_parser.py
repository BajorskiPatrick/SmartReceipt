import json
import signal
import os
import re
from pathlib import Path
from llama_cpp import Llama
from llama_cpp.llama_types import (
    ChatCompletionRequestSystemMessage,
    ChatCompletionRequestUserMessage,
    ChatCompletionRequestResponseFormat,
)
from paddleocr import PaddleOCR
from app.utils.logger import get_logger
from app.services.interfaces import BaseParser

logger = get_logger("LocalLlmParser")

try:
    signal.signal(signal.SIGINT, signal.default_int_handler)
    signal.signal(signal.SIGTERM, signal.SIG_DFL)
except Exception:
    pass


def _post_process(items: list[dict]) -> list[dict]:
    """
    Czyści dane. Wersja AGRESYWNA dla paragonów fiskalnych.
    """
    clean_items = []

    # Rozszerzona czarna lista
    BLACKLIST = [
        # Promocje i Rabaty
        "OBNIZKA", "RABAT", "PROMOCJA", "GRATIS", "ZYSKUJESZ",

        # Płatności i Sumy
        "SUMA", "PODSUMOWANIE", "RAZEM", "DO ZAPŁATY", "DO ZAPLATY", "DOZAPLATY",  # <-- dodałem złączone
        "PŁATNOŚĆ", "PLATNOSC", "RESZTA", "KARTA", "GOTÓWKA", "GOTOWKA",
        "ROZLICZENIE", "ROZLICZEE", "WALUTA", "KREDYT", "PLN",  # <-- KREDYT i PLN

        # Podatki i Fiskalne
        "FISKALNY", "NIEFISKALNY", "PTU", "VAT", "NETTO", "BRUTTO",
        "OPODATKOWANA", "STAWKA", "PODATEK",

        # Dane Sklepu / Nagłówki / Systemowe
        "NIP", "REGON", "BDO", "ADRES", "UL.", "ULICA", "SPÓŁKA", "SPOLKA",
        "SPOTKA", "TOWA", "KOUANDY",
        "SPRZEDAZ", "SPRZEDAŻ", "DATA", "GODZINA", "NR SYS", "PARAGON",
        "KASJER", "KASA", "WYDRUK", "HANDLOWA", "SKLEP", "FIRMA",
        "EAG", "F200",  # <-- Prefiksy kas fiskalnych
    ]

    date_pattern = re.compile(r'\d{2}[-.]\d{2}[-.]\d{2,4}')
    time_pattern = re.compile(r'\d{2}:\d{2}')
    trash_tail_pattern = re.compile(r'(\*|\s\d+[\s]?szt|\s\d+[\s]?kg).*', re.IGNORECASE)

    for item in items:
        name = item.get("productName", "Nieznany")

        # --- 1. Szybkie Odrzucanie (Nazwa) ---
        name_upper = name.upper()

        # A. Blacklist
        if any(bad_word in name_upper for bad_word in BLACKLIST):
            continue

        # B. Wykrywanie hashy i numerów seryjnych (np. 76CDD8D5DBE64...)
        # Jeśli słowo jest długie (>15 znaków) i NIE MA spacji -> to na 99% śmieć systemowy
        if len(name) > 15 and " " not in name:
            continue
        if " " not in name and any(char.isdigit() for char in name):
            continue
        # C. Daty/Godziny
        if date_pattern.search(name) or time_pattern.search(name):
            continue

        # D. Za krótkie
        if len(name) < 3:
            continue

        # E. Wykrywanie samych liczb w nazwie (np. "16.00")
        # Usuwamy kropki i spacje, sprawdzamy czy zostały same cyfry
        if name.replace(".", "").replace(",", "").replace(" ", "").isdigit():
            continue

        # --- 2. Czyszczenie Ceny ---
        price_raw = item.get("price", 0.0)
        price = 0.0

        if isinstance(price_raw, (int, float)):
            price = float(price_raw)
        elif isinstance(price_raw, str):
            try:
                found_prices = re.findall(r'\d+[.,]\d{2}', price_raw.replace(",", "."))
                if found_prices:
                    price = float(found_prices[-1])
                else:
                    clean_str = price_raw.replace(",", ".").replace("zł", "").replace("PLN", "").strip()
                    price = float(clean_str)
            except ValueError:
                price = 0.0

        quantity = item.get("quantity", 1.0)

        # --- 3. Logika Odrzucania (Cena) ---
        if price <= 0.01: continue
        if price > 2000.0: continue

        # --- 4. Kosmetyka Nazwy ---
        name = trash_tail_pattern.sub('', name)
        name = re.sub(r'\s+[A-Z0-9]$', '', name)
        name = name.lstrip(".,-* ")

        if not name.strip():
            continue

        clean_items.append({"productName": name.strip(), "price": price, "quantity": quantity})

    return clean_items


class LLMReceiptParser(BaseParser):
    def __init__(self):
        # OCR na CPU (lekki)
        logger.info("Loading PaddleOCR (CPU mode)...")
        self.ocr = PaddleOCR(
            use_angle_cls=True, lang="pl", show_log=False, use_gpu=False
        )

        # Find model path
        MODEL_DIRECTORY_PATH = "app/ocr/models"
        model_files = Path(MODEL_DIRECTORY_PATH).glob("*.gguf")
        if not model_files:
            raise FileNotFoundError(f"No model files found in {MODEL_DIRECTORY_PATH}")
        MODEL_PATH = str(next(model_files))

        # GPU Layers - ustawienie
        gpu_layers = int(os.getenv("SR_GPU_LAYERS", 33))  # 33 to zazwyczaj max dla 8B na RTX 3060/4060
        logger.info(f"Loading model from {MODEL_PATH} on GPU with {gpu_layers} GPU layers...")

        try:
            # Context 4096 jest bezpieczny dla paragonów
            self.llm = Llama(
                model_path=MODEL_PATH, n_ctx=4096, n_gpu_layers=gpu_layers, verbose=False
            )
            logger.info("Model loaded.")
        except Exception as e:
            logger.error(f"Failed to load Llama model: {e}")
            raise e

    def _extract_text(self, image_path: Path) -> str:
        try:
            result = self.ocr.ocr(str(image_path), cls=True)
            raw_lines = []
            if result and result[0]:
                for line in result[0]:
                    raw_lines.append(line[1][0])
            return "\n".join(raw_lines)
        except Exception as e:
            logger.error(f"OCR failed: {e}")
            return ""

    def parse(self, image_path: Path) -> dict:  # <-- Zmieniony typ zwrotny na dict
        # 1. OCR
        raw_text = self._extract_text(image_path)
        if not raw_text:
            return {"items": []}

        logger.info(f"OCR Text length: {len(raw_text)} characters")
        logger.info("Raw OCR Text:")
        logger.info(raw_text)
        # 2. Definicja Schematu JSON (Kaftan bezpieczeństwa)
        json_schema = {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "productName": {"type": "string"},
                            "price": {"type": "number"},
                            "quantity": {"type": "number"}
                        },
                        "required": ["productName", "price", "quantity"]
                    }
                }
            },
            "required": ["items"]
        }

        # 3. Prompt Engineering
        system_prompt = "Jesteś parserem paragonów. Zwracaj TYLKO JSON zgodnie ze schematem."

        user_prompt = f"""
        Twoim zadaniem jest wyciągnięcie listy wszystkich zakupionych produktów z tekstu paragonu.

        ### KRYTYCZNE ZASADY:
        1. **KAŻDA LINIA TO PRODUKT:** Analizuj tekst linijka po linijce.
        2. **NIE POMIJAJ POWTÓRZEŃ:** Jeśli widzisz 5 linii z "BUŁKA ... 1.49", masz zwrócić 5 osobnych obiektów JSON.
        3. **NIE GRUPUJ:** Nie sumuj ilości (quantity). Jeśli produkt występuje 3 razy osobno, zwróć go 3 razy jako osobne wpisy z quantity 1.0.
        4. POPRAWIAJ LITERÓWKI (np. "LO6ITECH" -> "LOGITECH").
        5. IGNORUJ pozycje: "RABAT", "OBNIZKA", "PROMOCJA", "RESZTA".
        6. IGNORUJ reklamy (ceny 0.00).

        ### PRZYKŁAD OBSŁUGI POWTÓRZEŃ:
        INPUT:
        "KAJZERKA ... 0.50
        KAJZERKA ... 0.50"

        OUTPUT:
        {{ "items": [ {{ "productName": "KAJZERKA", "price": 0.50, "quantity": 1.0 }}, {{ "productName": "KAJZERKA", "price": 0.50, "quantity": 1.0 }} ] }}

        ### DANE WEJŚCIOWE (OCR):
        --------------------------------------------------
        '''
        {raw_text}
        '''
        --------------------------------------------------
        """

        try:
            # 4. Inference
            response = self.llm.create_chat_completion(
                messages=[
                    ChatCompletionRequestSystemMessage(role="system", content=system_prompt),
                    ChatCompletionRequestUserMessage(role="user", content=user_prompt),
                ],
                temperature=0.1,  # Niski - ma być precyzyjny
                max_tokens=4096,  # Dużo miejsca na długie paragony
                repeat_penalty=1.05,  # Lekka kara, żeby nie zjadał powtórzeń (bułek), ale nie wpadał w pętlę
                response_format=ChatCompletionRequestResponseFormat(type="json_object", schema=json_schema),
            )

            content = response["choices"][0]["message"]["content"]

            # Logowanie surowej odpowiedzi dla debugu
            logger.info(f"LLM Raw Response:\n{content}")

            # 5. Parsowanie i Czyszczenie
            start = content.find("{")
            end = content.rfind("}") + 1

            if start != -1 and end != -1:
                json_obj = json.loads(content[start:end])
                items = json_obj.get("items", [])

                # Czyścimy śmieci (nagłówki, NIPy, daty)
                cleaned_items = _post_process(items)

                logger.info(f"Parsed {len(cleaned_items)} valid items.")

                # ZWRACAMY SŁOWNIK (Naprawa błędu w ocr.py)
                return {"items": cleaned_items}
            else:
                logger.warning(f"LLM returned invalid format: {content}")
                return {"items": []}

        except Exception as e:
            logger.error(f"LLM Processing error: {e}")
            return {"items": []}