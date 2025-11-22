from ultralytics import YOLO
from pathlib import Path
import random
import shutil

# --- KONFIGURACJA ---
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "src/ocr/models/receipt_yolo_best.pt"
CORD_RAW_DIR = BASE_DIR / "data/cord/train"
OUTPUT_DIR = BASE_DIR / "data/detections/visual_test"
DATASET_YAML = BASE_DIR / "data/yolo_dataset/data.yaml"


def evaluate():
    # 1. Ładowanie modelu
    if not MODEL_PATH.exists():
        print(f"❌ Nie znaleziono modelu w {MODEL_PATH}")
        print(
            "   Upewnij się, że skopiowałeś 'best.pt' po treningu (skrypt train_receipt_detector.py to robi)."
        )
        return

    model = YOLO(str(MODEL_PATH))

    # --- CZĘŚĆ A: Metryki (na danych oznaczonych w Roboflow) ---
    print("\n📊 --- OBLICZANIE METRYK (VALIDATION SET) ---")
    if DATASET_YAML.exists():
        metrics = model.val(data=str(DATASET_YAML))
        print(f"\n✅ mAP50 (Precyzja ogólna): {metrics.box.map50:.2%}")
        print(f"✅ mAP50-95 (Precyzja dokładna): {metrics.box.map:.2%}")
        print("(Im bliżej 100%, tym lepiej. Dla paragonów mAP50 > 90% to super wynik)")
    else:
        print("⚠️ Pomijam metryki (brak pliku data.yaml)")

    # --- CZĘŚĆ B: Test wzrokowy (na surowych danych CORD) ---
    print("\n👁️ --- TEST WZROKOWY (RAW CORD DATA) ---")

    # Czyścimy stary folder z wynikami
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Pobieramy wszystkie pliki png/jpg
    all_images = list(CORD_RAW_DIR.glob("*.png")) + list(CORD_RAW_DIR.glob("*.jp*g"))

    if not all_images:
        print("❌ Brak zdjęć w data/cord/train")
        return

    # Bierzemy losowe 20 zdjęć, żeby nie czekać wieki
    sample_size = min(20, len(all_images))
    selected_images = random.sample(all_images, sample_size)

    print(f"🚀 Przetwarzam {sample_size} losowych zdjęć z {CORD_RAW_DIR}...")

    # Uruchamiamy predykcję i zapisujemy wyniki
    # save=True -> YOLO samo narysuje ramki i zapisze w runs/obb/predict...
    # my to potem przeniesiemy do Twojego folderu
    results = model.predict(
        source=selected_images,
        save=True,
        conf=0.25,  # Minimalna pewność (25%)
        project=str(OUTPUT_DIR.parent),  # Zapisz w data/detections
        name="visual_test",  # Podfolder
        exist_ok=True,  # Nadpisz
    )

    print("\n✅ Zakończono! Wyniki wizualne zapisano w:")
    print(f"📂 {OUTPUT_DIR}")
    print("👉 Wejdź tam i zobacz, czy ramki dobrze obejmują paragony.")


if __name__ == "__main__":
    evaluate()
