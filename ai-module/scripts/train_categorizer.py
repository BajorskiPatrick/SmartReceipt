from setfit import SetFitModel, SetFitTrainer
from datasets import Dataset
import shutil
from pathlib import Path
# --- POPRAWKA: Importujemy klasę straty ---
from sentence_transformers.losses import CosineSimilarityLoss

# Ścieżka gdzie zapiszemy Twój wytrenowany model
OUTPUT_DIR = Path("src/nlp/models/my-receipt-categorizer")

# 1. PRZYGOTOWANIE DANYCH (Few-Shot)
data = [
    # --- SPOŻYWCZE ---
    ("Mleko 3.2% Łaciate", "Spożywcze"),
    ("Chleb wiejski krojony", "Spożywcze"),
    ("Masło Extra", "Spożywcze"),
    ("Ser Gouda plastry", "Spożywcze"),
    ("Pomidory luz", "Spożywcze"),
    ("Kurczak filet z piersi", "Spożywcze"),
    ("Baton Snickers", "Spożywcze"),
    ("Chipsy Lay's paprykowe", "Spożywcze"),
    ("Nasi Putih", "Spożywcze"),  # CORD
    ("Chicken Picatta", "Spożywcze"),  # CORD

    # --- NAPOJE ---
    ("Coca Cola 0.5L", "Napoje"),
    ("Woda Żywiec Zdrój", "Napoje"),
    ("Sok pomarańczowy 100%", "Napoje"),
    ("Java Tea", "Napoje"),  # CORD
    ("Ice Tea Peach", "Napoje"),
    ("Pepsi Max", "Napoje"),

    # --- ALKOHOL I UŻYWKI ---
    ("Piwo Tyskie 0.5L", "Alkohol i Używki"),
    ("Wódka Wyborowa", "Alkohol i Używki"),
    ("Wino czerwone wytrawne", "Alkohol i Używki"),
    ("Papierosy Marlboro Gold", "Alkohol i Używki"),
    ("L&M Blue", "Alkohol i Używki"),
    ("Piwo Żywiec", "Alkohol i Używki"),

    # --- DOM I CHEMIA ---
    ("Domestos 1L", "Dom i Chemia"),
    ("Papier toaletowy 8 rolek", "Dom i Chemia"),
    ("Płyn do naczyń Ludwik", "Dom i Chemia"),
    ("Proszek do prania Vizir", "Dom i Chemia"),
    ("Ręcznik papierowy", "Dom i Chemia"),

    # --- KOSMETYKI ---
    ("Szampon Head&Shoulders", "Kosmetyki"),
    ("Żel pod prysznic Nivea", "Kosmetyki"),
    ("Pasta do zębów Colgate", "Kosmetyki"),
    ("Dezodorant Rexona", "Kosmetyki"),

    # --- RESTAURACJA (CORD) ---
    ("Burger wołowy zestaw", "Restauracja"),
    ("Pizza Margherita", "Restauracja"),
    ("Kebab w bułce", "Restauracja"),
    ("Sushi zestaw mały", "Restauracja"),
    ("Lunch dnia", "Restauracja"),

    # --- PODATKI I OPŁATY ---
    ("Service Charge", "Podatki i Opłaty"),
    ("Pajak Resto", "Podatki i Opłaty"),
    ("Opłata serwisowa", "Podatki i Opłaty"),
    ("Napiwek", "Podatki i Opłaty"),
    ("Koszt dostawy", "Podatki i Opłaty"),

    # --- INNE ---
    ("Torba foliowa", "Inne"),
    ("Reklamówka", "Inne"),
    ("Bilet autobusowy", "Transport"),
    ("Benzyna PB95", "Transport")
]

texts = [x[0] for x in data]
labels = [x[1] for x in data]

dataset = Dataset.from_dict({"text": texts, "label": labels})


def train():
    print("🚀 Pobieram bazowy model (MiniLM)...")
    model = SetFitModel.from_pretrained(
        "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    print("🏋️ Rozpoczynam trening (Fine-Tuning)...")

    trainer = SetFitTrainer(
        model=model,
        train_dataset=dataset,
        # --- POPRAWKA: Przekazujemy klasę, nie stringa ---
        loss_class=CosineSimilarityLoss,
        metric="accuracy",
        batch_size=16,
        num_iterations=20,
        num_epochs=1,
        column_mapping={"text": "text", "label": "label"}
    )

    trainer.train()

    print(f"💾 Zapisuję Twój wytrenowany model do: {OUTPUT_DIR}")
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    model.save_pretrained(str(OUTPUT_DIR))
    print("✅ Gotowe! Możesz używać modelu w categorizer.py")


if __name__ == "__main__":
    train()