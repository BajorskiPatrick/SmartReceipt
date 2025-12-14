from setfit import SetFitModel
from pathlib import Path
import torch
from app.utils.logger import get_logger
from app.services.interfaces import BaseCategorizer

logger = get_logger("ProductCategorizer")


class ProductCategorizer(BaseCategorizer):
    CONFIDENCE_THRESHOLD = 0.6

    def __init__(self):
        self.model_path = Path(__file__).parent / "models/my-receipt-categorizer"

        logger.info("Loading SetFit model...")

        if self.model_path.exists():
            self.model = SetFitModel.from_pretrained(str(self.model_path))

            if torch.cuda.is_available():
                self.model.to("cuda")
            logger.info(f"Categorizer uses device: {str(self.model.device)}")
        else:
            logger.error(f"Error: SetFit model not found at {self.model_path}")
            raise FileNotFoundError("SetFit model not found.")

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

        logger.info(f"Categorizing {len(items)} products (SetFit)...")

        productNames = [item["productName"] for item in items]

        # Inference run on whole batch - a lot faster
        categories = self.model.predict(productNames)
        probs = self.model.predict_proba(productNames)

        for i, item in enumerate(items):
            conf = probs[i].max().item()
            if categories[i] == "Ignore" or conf < self.CONFIDENCE_THRESHOLD:
                item["category"] = None
            else:
                item["category"] = str(categories[i])

        return items
