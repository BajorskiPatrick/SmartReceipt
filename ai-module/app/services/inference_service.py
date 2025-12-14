import uuid
import copy
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile

# Imports
# Upewnij się, że nazwa pliku to llm_parser.py (snake_case) lub LocalLlmReceiptParser.py
from app.ocr.llm_parser import LLMReceiptParser
from app.nlp.categorizer import ProductCategorizer
from app.utils.visualizer import Visualizer
from app.utils.logger import get_logger

logger = get_logger("InferenceService")

# Directory for debug visualizations
DEBUG_DIR = Path("data/debug_visualizations")
DEBUG_DIR.mkdir(parents=True, exist_ok=True)


class InferenceService:
    def __init__(self):
        # self.detector = None # YOLO usuwamy
        self.parser = None
        self.categorizer = None
        self.visualizer = Visualizer()

    def load_models(self):
        logger.info("⏳ Initializing AI Models...")

        # Sekcja YOLO usunięta - nie jest już potrzebna

        try:
            self.parser = LLMReceiptParser()
            logger.info("✅ Local LLM Parser (OCR+Llama) ready.")
        except Exception as e:
            logger.error(f"⚠️ Local LLM Parser Error: {e}")
            raise RuntimeError(f"Failed to load Local LLM Parser: {e}")

        try:
            self.categorizer = ProductCategorizer()
            logger.info("✅ Categorizer ready.")
        except Exception as e:
            logger.error(f"⚠️ Categorizer Error: {e}")
            raise RuntimeError(f"Failed to load Categorizer: {e}")

    async def process_receipt(self, file: UploadFile) -> list[dict]:
        # Generowanie ID i Timestampu
        request_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Oryginalna nazwa pliku (dla logów)
        original_filename = file.filename or "unknown.jpg"
        suffix = Path(original_filename).suffix or ".jpg"

        # Nowa nazwa pliku: DATA_GODZINA_UUID.jpg
        saved_filename = f"{timestamp}_{request_id}{suffix}"

        logger.info(f"[{request_id}] Processing receipt: {original_filename} -> {saved_filename}")

        target_path = DEBUG_DIR / saved_filename

        # 1. Zapis pliku
        with open(target_path, "wb") as f:
            content = await file.read()
            f.write(content)

        try:
            # Lazy load
            if not self.parser:
                self.load_models()

            # 2. OCR & Parsing (Llama)
            logger.info(f"[{request_id}] Running OCR on {target_path.name}...")

            if self.parser is None:
                raise RuntimeError("Parser not initialized.")

            # Parsowanie całego obrazka (bez cropowania YOLO)
            items = self.parser.parse(target_path)

            # Kopia do wizualizacji
            raw_items_copy = copy.deepcopy(items)

            # 3. Categorization (SetFit)
            if items and self.categorizer:
                logger.info(f"[{request_id}] Categorizing {len(items)} items...")
                self.categorizer.categorize_items(items)

            # 4. Visualization
            summary_filename = f"{timestamp}_{request_id}_summary.jpg"
            summary_path = DEBUG_DIR / summary_filename

            logger.info(f"[{request_id}] Saving visual report to {summary_path}")

            self.visualizer.create_summary(
                original_path=target_path,
                cropped_path=None,  # Nie ma cropa
                raw_items=raw_items_copy,
                final_items=items,
                output_path=summary_path
            )

            return items

        except Exception as e:
            logger.exception(f"[{request_id}] Processing failed")
            raise e
        finally:
            # Opcjonalne czyszczenie oryginału, jeśli chcesz oszczędzać miejsce
            # target_path.unlink(missing_ok=True)
            pass


inference_service = InferenceService()