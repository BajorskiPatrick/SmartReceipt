from setfit import SetFitModel
from pathlib import Path
from app.utils.logger import get_logger
from app.services.interfaces import BaseCategorizer
from app.nlp.config import KEYWORDS, CONFIDENCE_THRESHOLD

logger = get_logger("ProductCategorizer")


def _check_keywords(product_name: str) -> str | None:
    """Helper function to check for keywords in the product name."""
    name_upper = product_name.upper()
    for category, words in KEYWORDS.items():
        if any(word in name_upper for word in words):
            return category
    return None


class ProductCategorizer(BaseCategorizer):
    def __init__(self):
        self.model_path = Path(__file__).parent / "models/my-receipt-categorizer"

        logger.info("Loading SetFit model...")

        if self.model_path.exists():
            # force model to use cpu for llama resource optimization
            self.model = SetFitModel.from_pretrained(str(self.model_path), device="cpu")

            logger.info(f"Categorizer uses device: {str(self.model.device)}")
        else:
            logger.error(f"Error: SetFit model not found at {self.model_path}")
            raise FileNotFoundError("SetFit model not found.")

    def categorize_items(self, items: list) -> list:
        if not items:
            return []

        logger.info(f"Categorizing {len(items)} products...")
        productNames = [item["productName"] for item in items]

        # Inference
        categories = self.model.predict(productNames)
        probs = self.model.predict_proba(productNames)

        for i, item in enumerate(items):
            ai_category = str(categories[i])
            conf = probs[i].max().item()
            name = item["productName"]

            keyword_category = _check_keywords(name)

            if keyword_category:
                item["categoryName"] = keyword_category
                continue

            if conf >= CONFIDENCE_THRESHOLD:
                item["categoryName"] = ai_category
            else:
                item["categoryName"] = "Other"

        return items
