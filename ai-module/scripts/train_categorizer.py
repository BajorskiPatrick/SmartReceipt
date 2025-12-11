import json
import shutil
import sys
from pathlib import Path
from setfit import SetFitModel, SetFitTrainer
from datasets import Dataset
from sentence_transformers.losses import CosineSimilarityLoss
import logging

# Setup ścieżek
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TrainCategorizer")

# Konfiguracja
DATA_PATH = BASE_DIR / "data" / "set_fit_few_shot" / "dataset.json"  # json data
OUTPUT_DIR = BASE_DIR / "app" / "nlp" / "models" / "my-receipt-categorizer"


def load_data():
    """Wczytuje dane z pliku JSON i tworzy Dataset."""
    if not DATA_PATH.exists():
        logger.error(f"❌ Nie znaleziono pliku z danymi: {DATA_PATH}")
        sys.exit(1)

    logger.info(f"📂 Wczytuję dane z: {DATA_PATH}")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data_json = json.load(f)

    dataset = Dataset.from_list(data_json)

    logger.info(f"✅ Wczytano {len(dataset)} przykładów.")
    return dataset


def train():
    dataset = load_data()

    logger.info("🚀 Pobieram bazowy model (MiniLM)...")
    model = SetFitModel.from_pretrained(
        "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )

    logger.info("🏋️ Rozpoczynam trening (Fine-Tuning)...")

    trainer = SetFitTrainer(
        model=model,
        train_dataset=dataset,
        loss_class=CosineSimilarityLoss,
        metric="accuracy",
        batch_size=16,
        num_iterations=5,
        num_epochs=1,
        column_mapping={"text": "text", "label": "label"},
    )

    trainer.train()

    logger.info(f"💾 Zapisuję model do: {OUTPUT_DIR}")
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    model.save_pretrained(str(OUTPUT_DIR))
    logger.info("✅ Gotowe! Model zaktualizowany.")


if __name__ == "__main__":
    train()