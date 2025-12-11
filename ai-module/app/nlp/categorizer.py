from setfit import SetFitModel
from pathlib import Path
import torch
import sys

# Add project root to sys.path to allow running this script directly
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from app.utils.logger import get_logger

logger = get_logger("ProductCategorizer")

class ProductCategorizer:
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

    def categorize(self, product_name: str) -> dict:
        """
        Klasyfikuje produkt używając wytrenowanego modelu.
        """
        # SetFit zwraca bezpośrednio etykietę (string)
        # predict zwraca listę, bierzemy [0]
        preds = self.model.predict([product_name])
        best_category = preds[0]

        # Pobieranie pewności (opcjonalne, dla uproszczenia można pominąć)
        probs = self.model.predict_proba([product_name])
        confidence = probs.max().item()

        return {"category": str(best_category), "confidence": confidence}

    def categorize_items(self, items: list) -> list:
        if not items:
            return []

        logger.info(f"   🧠 Kategoryzuję {len(items)} produktów (SetFit)...")

        # SetFit jest szybki w batchach! Możemy wrzucić wszystko naraz.
        product_names = [item["product_name"] for item in items]

        # Inferencja na całej liście naraz (dużo szybciej)
        categories = self.model.predict(product_names)
        probs = self.model.predict_proba(product_names)

        for i, item in enumerate(items):
            item["category"] = str(categories[i])
            item["category_conf"] = probs[i].max().item()

        # Filtrujemy elementy oznaczone jako 'Ignore'
        # filtered_items = [item for item in items if item["category"] != "Ignore"]

        # logger.info(f"   🗑️ Usunięto {len(items) - len(filtered_items)} elementów 'Ignore'")

        return items


# --- TEST ---
if __name__ == "__main__":
    categorizer = ProductCategorizer()

    test_products = [
        "Mleko 3.2%",
        "Wódka Wyborowa",
        "Marlboro Gold",
        "Pajak Resto",
        "Chicken Picatta",
        "Domestos 1L",
        "Bilet do kina",
        "Uber Przejazd",
        "Szampon Nivea",
        "Torba foliowa",
        "Coca Cola 0.5L",
        # --- Śmieci do testowania ---
        "Suma PLN",
        "Visa 4231",
        "NIP 525-123-45-67",
        "Total USD",
        "Reszta",
        "Devolay",
        "Frytki"
    ] 

    logger.info(f"\n{'PRODUKT':<25} | {'KATEGORIA':<25} | {'PEWNOŚĆ'}")
    logger.info("-" * 65)

    for p in test_products:
        res = categorizer.categorize(p)
        logger.info(f"{p:<25} | {res['category']:<25} | {res['confidence']:.4f}")
