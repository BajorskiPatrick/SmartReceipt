import json
import re
from pathlib import Path
from llama_cpp import Llama
from paddleocr import PaddleOCR
from app.utils.logger import get_logger

logger = get_logger("LocalLlmParser")

MODEL_PATH = "app/ocr/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf"


def _post_process(items: list[dict]) -> list[dict]:
    """Dodatkowe zabezpieczenie typów danych"""
    clean_items = []
    for item in items:
        name = item.get("product_name", "Nieznany")
        price = item.get("price", 0.0)

        if isinstance(price, str):
            try:
                price = float(price.replace(',', '.').replace('zł', '').strip())
            except ValueError:
                price = 0.0

        clean_items.append({"product_name": name, "price": price})
    return clean_items


class LLMReceiptParser:
    def __init__(self):
        # OCR na CPU (use_gpu=False naprawia konflikt bibliotek)
        logger.info("⏳ Loading PaddleOCR (CPU mode)...")
        self.ocr = PaddleOCR(use_angle_cls=True, lang='pl', show_log=False, use_gpu=False)

        # LLM na GPU
        logger.info(f"⏳ Loading Llama 3B from {MODEL_PATH}...")
        try:
            self.llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=4096,
                n_gpu_layers=-1, 
                verbose=False
            )
            logger.info("✅ Llama 3B loaded on GPU.")
        except Exception as e:
            logger.error(f"❌ Failed to load Llama model: {e}")
            raise e

    def extract_text(self, image_path: Path) -> str:
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

    def parse(self, image_path: Path) -> list[dict]:
        # 1. OCR
        raw_text = self.extract_text(image_path)
        if not raw_text:
            return []
        logger.info(f"OCR Text:\n{raw_text}")

        # 2. Prompt
        system_prompt = "Jesteś parserem paragonów. Zwracaj TYLKO JSON."
        
        # Few shot examples w promptach
        user_prompt = f"""
        Analizujesz tekst OCR z polskiego paragonu.
        
        TWOJE ZADANIE:
        Wyciągnij produkty TYLKO z sekcji "TEKST DO ANALIZY" poniżej.
        NIE WOLNO Ci przepisywać przykładów podanych poniżej!
        
        --- POCZĄTEK PRZYKŁADÓW TRENINGOWYCH (NIE KOPIUJ TEGO!) ---
        Input: "Danie barowe B 1szt.*16.00" -> {{"items": [{{"product_name": "Danie barowe", "price": 16.00}}]}}
        Input: "Woda Min. 2 x 5,00" -> {{"items": [{{"product_name": "Woda Min.", "price": 5.00}}]}}
        --- KONIEC PRZYKŁADÓW ---

        TEKST DO ANALIZY (Tylko stąd bierz dane!):
        '''
        {raw_text}
        '''
        
        Zwróć JSON z kluczem "items".
        """
        
        try:
            # 3. Inferencja
            response = self.llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"} # To wymaga formatu {...} a nie [...]
            )
            
            content = response["choices"][0]["message"]["content"]
            
            logger.info(f"OCR Text:\n{content}")
            # 4. Parsowanie
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                json_obj = json.loads(content[start:end])
                
                # Kluczowa zmiana: pobieramy listę z klucza 'items'
                items = json_obj.get("items", [])
                
                # Szybkie czyszczenie w Pythonie (na wszelki wypadek)
                return _post_process(items)
            else:
                logger.warning(f"LLM returned invalid format: {content}")
                return []
                
        except Exception as e:
            logger.error(f"LLM Processing error: {e}")
            return []

