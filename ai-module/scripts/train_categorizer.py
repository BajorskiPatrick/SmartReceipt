import json
import shutil
import sys
import os
import random
from pathlib import Path

import numpy as np
import torch
from setfit import SetFitModel, SetFitTrainer
from datasets import Dataset
from sentence_transformers.losses import CosineSimilarityLoss
import logging

# ======================
# CONFIG
# ======================
SEED = 42

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

DATA_PATH = BASE_DIR / "data" / "set_fit_few_shot" / "dataset.json"
MODEL_DIR = Path(os.environ.get(
    "MODEL_DIR",
    BASE_DIR / "models" / "my-receipt-categorizer"
))

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ======================
# LOGGING
# ======================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("TrainCategorizer")

# ======================
# REPRODUCIBILITY
# ======================
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)

# ======================
# DATA
# ======================
def load_data():
    if not DATA_PATH.exists():
        logger.error(f"Dataset not found: {DATA_PATH}")
        sys.exit(1)

    logger.info(f"Loading dataset: {DATA_PATH}")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data_json = json.load(f)

    dataset = Dataset.from_list(data_json)
    logger.info(f"Loaded {len(dataset)} samples")
    return dataset


# ======================
# TRAINING
# ======================
def train():
    dataset = load_data()

    if MODEL_DIR.exists():
        logger.info(f"⚠️ Model already exists at {MODEL_DIR}, overwriting")
        shutil.rmtree(MODEL_DIR)

    logger.info(f"🚀 Loading base model on {DEVICE}")
    model = SetFitModel.from_pretrained(
        "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
        device=DEVICE
    )

    trainer = SetFitTrainer(
        model=model,
        train_dataset=dataset,
        loss_class=CosineSimilarityLoss,
        metric="accuracy",
        batch_size=16,
        num_iterations=5,
        num_epochs=1,
        column_mapping={"text": "text", "label": "label"},
        seed=SEED,
    )

    logger.info("SetFit training started")
    trainer.train()

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(str(MODEL_DIR))

    repo_id = "Johnyyy123/smart-receipt-categorizer-v1"
    logger.info(f"📤 Pushing model to Hugging Face Hub: {repo_id}")
    model.push_to_hub(repo_id=repo_id, commit_message="Initial commit")

    logger.info(f"✅ Model saved to {MODEL_DIR}")


if __name__ == "__main__":
    train()
