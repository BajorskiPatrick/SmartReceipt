from setfit import SetFitModel
from pathlib import Path
import torch
import sys

# Add project root to sys.path to allow running this script directly
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from app.utils.logger import get_logger

logger = get_logger("ProductCategorizer")

class ProductCategorizer:
    CONFIDENCE_THRESHOLD = 0.6

    def __init__(self):
        # Ścieżka do Twojego modelu
        self.model_path = Path(__file__).parent / "models/my-receipt-categorizer"

        logger.info("   ⏳ Ładowanie Twojego modelu SetFit...")

        # Sprawdzamy czy mamy wytrenowany model
        if self.model_path.exists():
            self.model = SetFitModel.from_pretrained(str(self.model_path))
            # SetFit sam zarządza GPU, ale można wymusić przeniesienie body modelu
            if torch.cuda.is_available():
                self.model.to("cuda")
                logger.info("   🚀 Kategoryzator używa GPU (SetFit Fine-Tuned)!")
        else:
            logger.error(
                "❌ BŁĄD: Nie znaleziono modelu! Uruchom najpierw scripts/train_categorizer.py"
            )
            # Fallback (opcjonalnie) - można tu załadować bazowy model
            raise FileNotFoundError("Brak modelu. Wytrenuj go!")

    def categorize(self, productName: str) -> dict:
        """
        Klasyfikuje produkt używając wytrenowanego modelu.
        """

        preds = self.model.predict([productName])
        best_category = preds[0]

        probs = self.model.predict_proba([productName])
        confidence = probs.max().item()

        return {"category": str(best_category), "confidence": confidence}

    def categorize_items(self, items: list) -> list:
        if not items:
            return []

        logger.info(f"   🧠 Kategoryzuję {len(items)} produktów (SetFit)...")

        productNames = [item["productName"] for item in items]

        # Inferencja na całej liście naraz (dużo szybciej)
        categories = self.model.predict(productNames)
        probs = self.model.predict_proba(productNames)

        for i, item in enumerate(items):
            conf = probs[i].max().item()
            if categories[i] == "Ignore" or conf < self.CONFIDENCE_THRESHOLD:
                item["category"] = None
            else:
                item["category"] = str(categories[i])

        return items