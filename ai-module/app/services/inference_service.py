import uuid
import copy
from fastapi.concurrency import run_in_threadpool
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile
from app.ocr.llm_parser import LLMReceiptParser
from app.nlp.categorizer import ProductCategorizer
from app.utils.visualizer import Visualizer
from app.utils.logger import get_logger
from functools import lru_cache
from app.services.interfaces import BaseParser, BaseCategorizer, BaseVisualizer

logger = get_logger("InferenceService")

# Directory for debug visualizations
DEBUG_DIR = Path("data/debug_visualizations")
DEBUG_DIR.mkdir(parents=True, exist_ok=True)


class InferenceService:
    def __init__(
        self,
        parser: BaseParser,
        categorizer: BaseCategorizer,
        visualizer: BaseVisualizer,
    ):
        self.parser = parser
        self.categorizer = categorizer
        self.visualizer = visualizer

    async def process_receipt(self, file: UploadFile) -> list[dict]:
        request_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        original_filename = file.filename or "unknown.jpg"
        suffix = Path(original_filename).suffix or ".jpg"

        saved_filename = f"{timestamp}_{request_id}{suffix}"

        logger.info(
            f"[{request_id}] Processing receipt: {original_filename} -> {saved_filename}"
        )

        target_path = DEBUG_DIR / saved_filename

        # Saving an uploaded file
        with open(target_path, "wb") as f:
            content = await file.read()
            f.write(content)

        try:

            # OCR & Parsing (Llama)
            logger.info(f"[{request_id}] Running OCR on {target_path.name}...")

            if self.parser is None:
                raise RuntimeError("Parser not initialized.")

            items = await run_in_threadpool(self.parser.parse, target_path)

            # Copy for visualization
            raw_items_copy = copy.deepcopy(items)

            # Categorization (SetFit)
            if items and self.categorizer:
                logger.info(f"[{request_id}] Categorizing {len(items)} items...")
                await run_in_threadpool(self.categorizer.categorize_items, items)

            # Visualization
            summary_filename = f"{timestamp}_{request_id}_summary.jpg"
            summary_path = DEBUG_DIR / summary_filename

            logger.info(f"[{request_id}] Saving visual report to {summary_path}")

            self.visualizer.visualize(
                original_path=target_path,
                raw_items=raw_items_copy,
                final_items=items,
                output_path=summary_path,
            )

            return items

        except Exception as e:
            logger.exception(f"[{request_id}] Processing failed")
            raise e
        finally:
            pass


_inference_service_instance: InferenceService | None = None


@lru_cache()
def get_inference_service() -> InferenceService:
    global _inference_service_instance
    if _inference_service_instance is None:
        _inference_service_instance = InferenceService(
            parser=LLMReceiptParser(),
            categorizer=ProductCategorizer(),
            visualizer=Visualizer(),
        )
    return _inference_service_instance
