import uuid
import copy
from pathlib import Path
from fastapi import UploadFile

# Imports
# from app.ocr.donut_parser import DonutReceiptParser
from app.ocr.LocalLlmReceiptParser import LocalLlmReceiptParser
from app.ocr.receipt_detector import ReceiptDetector
from app.nlp.categorizer import ProductCategorizer
from app.utils.visualizer import Visualizer
from app.utils.logger import get_logger

logger = get_logger("InferenceService")

# Directory for debug visualizations
DEBUG_DIR = Path("data/debug_visualizations")
DEBUG_DIR.mkdir(parents=True, exist_ok=True)

class InferenceService:
    def __init__(self):
        self.detector = None
        self.parser = None
        self.categorizer = None
        self.visualizer = Visualizer()

    def load_models(self):
        logger.info("⏳ Initializing AI Models...")
        
        try:
            self.detector = ReceiptDetector()
            logger.info("✅ YOLO Detector ready.")
        except Exception as e:
            logger.error(f"⚠️ YOLO Error: {e}")
            raise RuntimeError(f"Failed to load YOLO Detector: {e}")

        try:
            self.parser = LocalLlmReceiptParser()
            logger.info("✅ Local LLM Parser ready.")
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
        request_id = str(uuid.uuid4())[:8]
        filename = file.filename or "unknown.jpg"
        logger.info(f"[{request_id}] Processing receipt: {filename}")

        # 1. Save original file
        suffix = Path(filename).suffix or ".jpg"
        
        # Save to persistent debug dir immediately for visualization
        orig_path = DEBUG_DIR / f"{request_id}_orig{suffix}"
        
        with open(orig_path, "wb") as f:
            content = await file.read()
            f.write(content)

        cropped_path = DEBUG_DIR / f"{request_id}_crop.jpg"
        target_path = orig_path
        
        try:
            if not self.parser:
                self.load_models()

            # # 2. YOLO Crop
            # if self.detector:
            #     logger.info(f"[{request_id}] Running YOLO...")
            #     processed_img = self.detector.process(orig_path, output_path=cropped_path)
                
            #     if processed_img is not None:
            #         logger.info(f"[{request_id}] Receipt detected and cropped.")
            #         target_path = cropped_path
            #     else:
            #         logger.warning(f"[{request_id}] YOLO failed to detect receipt. Using original.")

            # 3. Donut OCR
            logger.info(f"[{request_id}] Running Donut on {orig_path.name}...")

            if self.parser is None:
                raise RuntimeError("Donut parser not initialized.")
            
            items = self.parser.parse(orig_path)
            
            # Keep a copy of raw items for visualization before categorization modifies them
            raw_items_copy = copy.deepcopy(items)

            # 4. Categorization
            if items and self.categorizer:
                logger.info(f"[{request_id}] Categorizing {len(items)} items...")
                self.categorizer.categorize_items(items)

            # 5. Visualization / Debug Storage
            summary_path = DEBUG_DIR / f"{request_id}_summary.jpg"
            logger.info(f"[{request_id}] Saving visual report to {summary_path}")
            
            self.visualizer.create_summary(
                original_path=orig_path,
                cropped_path=cropped_path if target_path == cropped_path else None,
                raw_items=raw_items_copy,
                final_items=items,
                output_path=summary_path
            )

            return items

        except Exception as e:
            logger.exception(f"[{request_id}] Processing failed")
            raise e
        finally:
            # Optional: Clean up orig/crop if you only want the summary jpg
            # orig_path.unlink(missing_ok=True)
            # cropped_path.unlink(missing_ok=True)
            pass

inference_service = InferenceService()
