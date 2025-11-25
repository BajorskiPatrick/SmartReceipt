from pathlib import Path
import shutil
import sys
import matplotlib.pyplot as plt  # Potrzebne, jesli uv nie dociagnelo zaleznosci visualizera

# Dodajemy ścieżkę do projektu
BASE_DIR = Path(__file__).parent
sys.path.append(str(BASE_DIR))

from src.ocr.receipt_detector import ReceiptDetector
from src.ocr.receipt_parser import ReceiptParser
# NOWY IMPORT
from src.utils.visualizer import Visualizer
from src.ocr.donut_parser import DonutReceiptParser
# Konfiguracja ścieżek
RAW_DIR = BASE_DIR / "data/cord/train"
PROCESSED_DIR = BASE_DIR / "data/processed/train"
RESULTS_DIR = BASE_DIR / "data/detections/train"
DEBUG_DIR = BASE_DIR / "data/debug"
# NOWY FOLDER NA RAPORTY GRAFICZNE
VISUAL_DIR = BASE_DIR / "data/visualizations"

# Tworzenie katalogów
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
VISUAL_DIR.mkdir(parents=True, exist_ok=True)

if DEBUG_DIR.exists():
    shutil.rmtree(DEBUG_DIR)
DEBUG_DIR.mkdir(parents=True, exist_ok=True)


def main():
    print("--- SmartReceipt Pipeline + Visualization ---")

    try:
        detector = ReceiptDetector()
        parser = DonutReceiptParser()
        visualizer = Visualizer()  # Inicjalizacja wizualizera
    except Exception as e:
        print(f"❌ Błąd inicjalizacji: {e}")
        return

    images = list(RAW_DIR.glob("*.png")) + list(RAW_DIR.glob("*.jpg"))
    images = images[:5]

    if not images:
        print(f"⚠️ Brak zdjęć w {RAW_DIR}")
        return

    for img_file in images:
        print(f"\n📄 Przetwarzam: {img_file.name}")

        # 1. YOLO
        cropped_path = PROCESSED_DIR / img_file.name
        processed_img = detector.process(img_file, output_path=cropped_path)

        if processed_img is None:
            print("   ⚠️ Nie wykryto paragonu.")
            continue

        # 2. OCR Pipeline
        items = parser.parse(cropped_path, debug_dir=DEBUG_DIR)

        # Ścieżka do pliku, który wygenerował ReceiptParser w folderze debug
        # Uwaga: w ReceiptParser.py zapisujemy to jako f"ocr_input_{image_path.name}"
        debug_img_path = DEBUG_DIR / f"ocr_input_{img_file.name}"

        # 3. GENEROWANIE RAPORTU GRAFICZNEGO
        vis_output = VISUAL_DIR / f"report_{img_file.stem}.jpg"

        visualizer.create_summary(
            original_path=img_file,
            cropped_path=cropped_path,
            items=items,
            output_path=vis_output
        )

        if items:
            print(f"   ✅ Znaleziono {len(items)} produktów.")
            print(f"   📊 Raport graficzny zapisano: {vis_output}")
        else:
            print(f"   ⚠️ Brak produktów. Raport błędu zapisano: {vis_output}")

    print(f"\n🏁 Zakończono. Otwórz folder: {VISUAL_DIR}")


if __name__ == "__main__":
    main()