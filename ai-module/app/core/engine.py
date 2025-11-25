import asyncio
import torch
import shutil
import uuid
import time
from pathlib import Path

from app.core.config import settings
from src.ocr.receipt_detector import ReceiptDetector
from src.ocr.donut_parser import DonutReceiptParser
from src.nlp.categorizer import ProductCategorizer
from src.utils.visualizer import Visualizer

class AIEngine:
    def __init__(self):
        self.detector = None
        self.parser = None
        self.categorizer = None
        self.visualizer = None

        self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_REQUESTS)

    def load_models(self):
        print("Ładowanie modeli AI...")
        self.detector = ReceiptDetector()
        self.parser = DonutReceiptParser()
        self.categorizer = ProductCategorizer()
        self.visualizer = Visualizer()
        print(f"Modele załadowane pomyślnie.") #TODO: change to global logger saved to google cloud later on in production

    async def process_receipt(self, file_content: bytes, filename: str) -> dict:

        # Czekaj na dostęp do paragonu
        async with self._semaphore:
            start_time = time.time()
            unique_id = str(uuid.uuid4())
            file_ext = filename.split(".")[-1]

            # zapisz plik tymczasowy
            input_path = settings.UPLOAD_DIR / f"{unique_id}.{file_ext}"
            with open(input_path, "wb") as f:
                f.write(file_content)

            try:
                # YOLO
                cropped_path = settings.UPLOAD_DIR / f"crop_{unique_id}.jpg"

                processed_img = await asyncio.to_thread(
                    self.detector.process, input_path, output_path=cropped_path
                )

                if processed_img is None:
                    return {"status": "error", "message": "No receipt found"}

                # Donut
                items = await asyncio.to_thread(
                    self.parser.parse, cropped_path
                )

                # SetFit
                if items:
                    items = await asyncio.to_thread(
                        self.categorizer.categorize_items, items
                    )

                # Wizualizacja
                #TODO: only save corner cases in production to save space
                report_path = settings.VISUAL_DIR / f"report_{unique_id}.jpg"
                await asyncio.to_thread(
                    self.visualizer.create_summary,
                    original_path=input_path,
                    cropped_path=cropped_path,
                    items=items,
                    output_path=report_path
                )

                duration = time.time() - start_time

                return {
                    "status": "success",
                    "receipt_id": unique_id,
                    "processing_time": round(duration, 2),
                    "items_count": len(items),
                    "items": items,
                    "debug_image_path": str(report_path)
                }
            finally:

                if input_path.exists():
                    input_path.unlink()
                # if cropped_path.exists():
                #     cropped_path.unlink() TODO: for debugging purposes we keep the cropped images

engine = AIEngine()