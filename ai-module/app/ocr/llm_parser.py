import json
import signal
from llama_cpp import Llama
from llama_cpp.llama_types import (
    ChatCompletionRequestSystemMessage,
    ChatCompletionRequestUserMessage,
    ChatCompletionRequestResponseFormat,
)
from paddleocr import PaddleOCR
from app.utils.logger import get_logger
from app.services.interfaces import BaseParser
import os
from pathlib import Path

logger = get_logger("LocalLlmParser")



try:
    signal.signal(signal.SIGINT, signal.default_int_handler)
    signal.signal(signal.SIGTERM, signal.SIG_DFL)
except Exception:
    pass


def _post_process(items: list[dict]) -> list[dict]:
    """Dodatkowe zabezpieczenie typów danych"""
    clean_items = []
    for item in items:
        name = item.get("productName", "Nieznany")
        price = item.get("price", 0.0)
        quantity = item.get("quantity", 1)

        if isinstance(price, str):
            try:
                price = float(price.replace(",", ".").replace("zł", "").strip())
            except ValueError:
                price = 0.0

        clean_items.append({"productName": name, "price": price, "quantity": quantity})
    return clean_items


class LLMReceiptParser(BaseParser):
    def __init__(self):
        # OCR na CPU
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
        # Hybrid LLM

        gpu_layers = int(os.getenv("SR_GPU_LAYERS", 15))
        logger.info(f"Loading model from {MODEL_PATH} on GPU with {gpu_layers} GPU layers...")

        try:
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

    def parse(self, image_path: Path) -> list[dict]:
        # OCR
        raw_text = self._extract_text(image_path)
        if not raw_text:
            return []
        logger.info(f"OCR Text:\n{raw_text[:1000]}...")

        # 2. Prompt
        system_prompt = "Jesteś parserem paragonów. Zwracaj TYLKO JSON."

        # Few shot examples w promptach
        user_prompt = f"""
                Jesteś zaawansowanym asystentem AI do ekstrakcji danych strukturalnych z OCR.

                ### KONTEKST
                Otrzymujesz surowy tekst z polskiego paragonu fiskalnego. Tekst może zawierać błędy OCR, nagłówki sklepu, stopki podatkowe i reklamy.

                ### CEL
                Twoim jedynym zadaniem jest wyodrębnienie listy zakupionych produktów i ich cen końcowych.

                ### INSTRUKCJA ANALIZY
                1. Przeanalizuj każdą linię tekstu.
                2. Zidentyfikuj linie reprezentujące produkty (zazwyczaj zawierają nazwę i cenę).
                3. Odrzuć sekcje metadanych:
                   - Nagłówki (Nazwa sklepu, Adres, NIP).
                   - Stopki (Suma, Sprzedaż opodatkowana, PTU, Rozliczenie płatności).
                4. Znormalizuj ceny (zamień przecinki na kropki).

                ### FORMAT DANYCH (JSON)
                Zwróć obiekt JSON w formacie:
                {{
                  "items": [
                    {{ "productName": "Nazwa Produktu", "price": 10.50, "quantity": 1.0 }}
                  ]
                }}

                ### PRZYKŁAD (Few-Shot)
                Input:
                "PIZZA DOMINO
                Ul. Prosta 1
                Pizza Capricciosa ... 32,00
                Sos czosnkowy 1x 3.50
                Suma PLN: 35.50"

                Output:
                {{ "items": [ {{ "productName": "Pizza Capricciosa", "price": 32.00, "quantity": 1.0 }}, {{ "productName": "Sos czosnkowy", "price": 3.50, "quantity": 1.0 }} ] }}

                ### DANE WEJŚCIOWE
                '''
                {raw_text}
                '''

                JSON OUTPUT:
                """

        try:
            # Inference
            response = self.llm.create_chat_completion(
                messages=[
                    ChatCompletionRequestSystemMessage(
                        role="system", content=system_prompt
                    ),
                    ChatCompletionRequestUserMessage(role="user", content=user_prompt),
                ],
                temperature=0.1,
                max_tokens=1024,
                response_format=ChatCompletionRequestResponseFormat(type="json_object"),
            )

            content = response["choices"][0]["message"]["content"]

            logger.info(f"OCR Text:\n{content}")
            # Parsing LLM output
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end != -1:
                json_obj = json.loads(content[start:end])

                items = json_obj.get("items", [])

                return _post_process(items)
            else:
                logger.warning(f"LLM returned invalid format: {content}")
                return []

        except Exception as e:
            logger.error(f"LLM Processing error: {e}")
            return []
