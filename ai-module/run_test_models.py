from pathlib import Path
import shutil
import sys
import copy

# Dodajemy ścieżkę do projektu
BASE_DIR = Path(__file__).parent
sys.path.append(str(BASE_DIR))

from app.ocr.receipt_detector import ReceiptDetector
from app.ocr.donut_parser import DonutReceiptParser
from app.nlp.categorizer import ProductCategorizer
from app.ocr.LocalLlmReceiptParser import LocalLlmReceiptParser
from app.utils.visualizer import Visualizer

from app.utils.logger import get_logger

logger = get_logger("TestModels")

# Konfiguracja ścieżek
RAW_DIR = BASE_DIR / "data/cord/train"
PROCESSED_DIR = BASE_DIR / "data/processed/train"
RESULTS_DIR = BASE_DIR / "data/detections/train"
DEBUG_DIR = BASE_DIR / "data/debug"
VISUAL_DIR = BASE_DIR / "data/visualizations"

# Tworzenie katalogów
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
VISUAL_DIR.mkdir(parents=True, exist_ok=True)

if DEBUG_DIR.exists():
    shutil.rmtree(DEBUG_DIR)
DEBUG_DIR.mkdir(parents=True, exist_ok=True)


def main():
    logger.info("--- SmartReceipt Pipeline + Visualization ---")

    try:
        detector = ReceiptDetector()
        parser = LocalLlmReceiptParser()
        categorizer = ProductCategorizer()
        visualizer = Visualizer()
    except Exception as e:
        logger.error(f"❌ Błąd inicjalizacji: {e}")
        return

    # images = list(RAW_DIR.glob("*.png")) + list(RAW_DIR.glob("*.jpg"))
    images = [Path("image.png")]

    if not images:
        logger.warning(f"⚠️ Brak zdjęć w {RAW_DIR}")
        return

    for img_file in images:
        if not img_file.exists():
            logger.warning(f"⚠️ Plik nie istnieje: {img_file}")
            continue
            
        logger.info(f"📄 Przetwarzam: {img_file.name}")

        # 1. YOLO (Crop)
        cropped_path = PROCESSED_DIR / img_file.name
        processed_img = detector.process(img_file, output_path=cropped_path)
        
        target_path = img_file
        if processed_img is not None:
            target_path = cropped_path
        else:
            logger.warning("   ⚠️ Nie wykryto paragonu (YOLO). Używam oryginału.")

        # 2. Donut (OCR)
        items = parser.parse(target_path, debug_dir=DEBUG_DIR)
        
        # Kopia surowych wyników dla wizualizera
        raw_items = copy.deepcopy(items)

        # 3. SetFit (Categorization)
        if items:
            categorizer.categorize_items(items)

        # 4. Wizualizacja
        vis_output = VISUAL_DIR / f"report_{img_file.stem}.jpg"

        visualizer.create_summary(
            original_path=img_file,
            cropped_path=cropped_path if target_path == cropped_path else None,
            raw_items=raw_items,
            final_items=items,
            output_path=vis_output,
        )

        if items:
            logger.info(f"   ✅ Znaleziono {len(items)} produktów.")
            logger.info(f"   📊 Raport graficzny zapisano: {vis_output}")
        else:
            logger.warning(f"   ⚠️ Brak produktów. Raport błędu zapisano: {vis_output}")

    logger.info(f"🏁 Zakończono. Otwórz folder: {VISUAL_DIR}")


if __name__ == "__main__":
    main()
