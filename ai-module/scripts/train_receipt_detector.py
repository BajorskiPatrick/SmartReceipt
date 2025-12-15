from ultralytics import YOLO
from pathlib import Path
import shutil
import sys

# Ustaw ścieżki relatywne
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from app.utils.logger import get_logger

logger = get_logger("TrainDetector")

DATASET_YAML = BASE_DIR / "data/yolo_dataset/data.yaml"
MODELS_DIR = BASE_DIR / "src/ocr/models"


def train():
    # Sprawdź czy dataset istnieje
    if not DATASET_YAML.exists():
        logger.error(f"❌ BŁĄD: Nie znaleziono pliku {DATASET_YAML}")
        logger.error(
            "   Pobierz dataset z Roboflow i wypakuj go do folderu ai-module/data/yolo_dataset/"
        )
        return

    # Pobierz model nano OBB
    logger.info("⬇️  Pobieranie/Ładowanie modelu YOLOv8n-OBB...")
    model = YOLO("yolov8n-obb.pt")

    logger.info(f"🚀 Rozpoczynam trening na danych z: {DATASET_YAML}")

    # Trening
    results = model.train(
        data=str(DATASET_YAML),
        epochs=150,
        imgsz=640,
        batch=8,
        patience=30,
        degrees=180,  # Kluczowe dla paragonów: rotacja +/- 180
        flipud=0.0,
        fliplr=0.0,
        mosaic=1.0,
        name="receipt_obb_run",
        project="runs/obb",
        exist_ok=True,
    )

    # Eksportuj najlepszy model
    best_model_source = Path("runs/obb/receipt_obb_run/weights/best.pt")
    if best_model_source.exists():
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        dest_path = MODELS_DIR / "receipt_yolo_best.pt"
        shutil.copy(best_model_source, dest_path)
        logger.info(f"✅ Sukces! Model zapisany w: {dest_path}")
    else:
        logger.warning("⚠️  Trening zakończony, ale nie znaleziono pliku best.pt")


if __name__ == "__main__":
    train()
