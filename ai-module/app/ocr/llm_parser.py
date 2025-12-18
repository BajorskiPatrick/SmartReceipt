import json
import signal
import os
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
from .cleaning import clean_items, clean_raw_text

logger = get_logger("LocalLlmParser")

try:
    signal.signal(signal.SIGINT, signal.default_int_handler)
    signal.signal(signal.SIGTERM, signal.SIG_DFL)
except Exception:
    pass


class LLMReceiptParser(BaseParser):
    def __init__(self):
        logger.info("Loading PaddleOCR (CPU mode)...")
        self.ocr = PaddleOCR(
            use_angle_cls=True, lang="pl", show_log=False, use_gpu=False
        )

        MODEL_DIRECTORY_PATH = "app/ocr/models"
        model_files = Path(MODEL_DIRECTORY_PATH).glob("*.gguf")
        if not model_files:
            raise FileNotFoundError(f"No model files found in {MODEL_DIRECTORY_PATH}")
        MODEL_PATH = str(next(model_files))

        gpu_layers = int(os.getenv("SR_GPU_LAYERS", -1))
        logger.info(
            f"Loading model from {MODEL_PATH} on GPU with {gpu_layers} GPU layers..."
        )

        try:
            self.llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=4096,
                n_gpu_layers=gpu_layers,
                n_batch=1024,
                flash_attn=True,
                verbose=True,
            )
            logger.info("Model loaded.")
        except Exception as e:
            logger.error(f"Failed to load Llama model (trying without flash_attn): {e}")
            try:
                self.llm = Llama(
                    model_path=MODEL_PATH,
                    n_ctx=4096,
                    n_gpu_layers=gpu_layers,
                    n_batch=1024,
                    verbose=True,
                )
                logger.info("Model loaded (fallback mode).")
            except Exception as e2:
                logger.error(f"Fatal error loading model: {e2}")
                raise e2

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

    def parse(self, image_path: Path) -> dict:
        raw_text = self._extract_text(image_path)
        if not raw_text:
            return {"items": []}

        clean_text = clean_raw_text(raw_text)

        logger.info(
            f"Original Text Len: {len(raw_text)} -> Cleaned Len: {len(clean_text)}"
        )

        if len(clean_text) < 10:
            logger.warning(
                "Pre-processing removed too much text. Using raw OCR fallback."
            )
            text_to_process = raw_text
        else:
            text_to_process = clean_text

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
                            "quantity": {"type": "number"},
                        },
                        "required": ["productName", "price", "quantity"],
                    },
                }
            },
            "required": ["items"],
        }

        system_prompt = (
            "Jesteś parserem paragonów. Zwracaj TYLKO JSON zgodnie ze schematem."
        )
        user_prompt = f"""
        Wyciągnij listę produktów.

        ZASADY:
        1. Analizuj linia po linii.
        2. Quantity zawsze 1.0 (chyba że tekst mówi inaczej).
        3. Zachowaj każde wystąpienie produktu.
        4. Poprawiaj literówki.

        INPUT (OCR):
        '''
        {text_to_process}
        '''
        """

        try:
            response = self.llm.create_chat_completion(
                messages=[
                    ChatCompletionRequestSystemMessage(
                        role="system", content=system_prompt
                    ),
                    ChatCompletionRequestUserMessage(role="user", content=user_prompt),
                ],
                temperature=0.1,
                max_tokens=4096,
                repeat_penalty=1.05,
                response_format=ChatCompletionRequestResponseFormat(
                    type="json_object", schema=json_schema
                ),
            )

            content = response["choices"][0]["message"]["content"]

            start = content.find("{")
            end = content.rfind("}") + 1

            if start != -1 and end != -1:
                json_obj = json.loads(content[start:end])
                items = json_obj.get("items", [])

                cleaned_items = clean_items(items)

                logger.info(f"Parsed {len(cleaned_items)} valid items.")
                return {"items": cleaned_items}
            else:
                return {"items": []}

        except Exception as e:
            logger.error(f"LLM Processing error: {e}")
            return {"items": []}
