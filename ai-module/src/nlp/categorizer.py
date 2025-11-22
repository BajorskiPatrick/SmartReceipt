from setfit import SetFitModel
from pathlib import Path
import torch


class ProductCategorizer:
    def __init__(self):
        # Ścieżka do Twojego modelu
        self.model_path = Path(__file__).parent.parent.parent / "src/nlp/models/my-receipt-categorizer"

        print("   ⏳ Ładowanie Twojego modelu SetFit...")

        # Sprawdzamy czy mamy wytrenowany model
        if self.model_path.exists():
            self.model = SetFitModel.from_pretrained(str(self.model_path))
            # SetFit sam zarządza GPU, ale można wymusić przeniesienie body modelu
            if torch.cuda.is_available():
                self.model.to("cuda")
                print("   🚀 Kategoryzator używa GPU (SetFit Fine-Tuned)!")
        else:
            print("❌ BŁĄD: Nie znaleziono modelu! Uruchom najpierw scripts/train_categorizer.py")
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

        # SetFit predict_proba zwraca prawdopodobieństwa dla wszystkich klas
        # (Trochę bardziej skomplikowane do wyciągnięcia dla jednej,
        # ale dla MVP sama kategoria wystarczy.
        # Jeśli potrzebujesz 'confidence', trzeba użyć model.predict_proba)

        # Pobieranie pewności (opcjonalne, dla uproszczenia można pominąć)
        probs = self.model.predict_proba([product_name])
        confidence = probs.max().item()

        return {
            "category": best_category,
            "confidence": confidence
        }

    def categorize_items(self, items: list) -> list:
        if not items: return []

        print(f"   🧠 Kategoryzuję {len(items)} produktów (SetFit)...")

        # SetFit jest szybki w batchach! Możemy wrzucić wszystko naraz.
        product_names = [item['product_name'] for item in items]

        # Inferencja na całej liście naraz (dużo szybciej)
        categories = self.model.predict(product_names)
        probs = self.model.predict_proba(product_names)

        for i, item in enumerate(items):
            item['category'] = categories[i]
            item['category_conf'] = probs[i].max().item()

        return items


# --- TEST ---
if __name__ == "__main__":
    categorizer = ProductCategorizer()

    test_products = [
        "Mleko 3.2%",
        "Wódka Wyborowa",
        "Marlboro Gold",  # To powinno teraz wejść w Używki, a nie w Inne/Ubrania
        "Pajak Resto",  # Powinno wejść w Podatki
        "Chicken Picatta"
    ]

    print(f"\n{'PRODUKT':<25} | {'KATEGORIA':<25} | {'PEWNOŚĆ'}")
    print("-" * 65)

    for p in test_products:
        res = categorizer.categorize(p)
        print(f"{p:<25} | {res['category']:<25} | {res['confidence']:.4f}")