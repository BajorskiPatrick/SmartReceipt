from setfit import SetFitModel, SetFitTrainer
from datasets import Dataset
import shutil
from pathlib import Path
import sys

# --- POPRAWKA: Importujemy klasę straty ---
from sentence_transformers.losses import CosineSimilarityLoss

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from app.utils.logger import get_logger
logger = get_logger("TrainCategorizer")

# Ścieżka gdzie zapiszemy Twój wytrenowany model
OUTPUT_DIR = Path("src/nlp/models/my-receipt-categorizer")

# 1. PRZYGOTOWANIE DANYCH (Few-Shot)
data = [
    # --- GROCERIES ---
    ("Mleko 3.2% Łaciate", "Groceries"),
    ("Chleb wiejski krojony", "Groceries"),
    ("Masło Extra", "Groceries"),
    ("Ser Gouda plastry", "Groceries"),
    ("Pomidory luz", "Groceries"),
    ("Kurczak filet z piersi", "Groceries"),
    ("Baton Snickers", "Groceries"),
    ("Chipsy Lay's paprykowe", "Groceries"),
    ("Fresh Milk 1L", "Groceries"),
    ("Whole Wheat Bread", "Groceries"),
    ("Butter Salted", "Groceries"),
    ("Cheddar Cheese", "Groceries"),
    ("Tomatoes", "Groceries"),
    ("Chicken Breast", "Groceries"),
    ("Chocolate Bar", "Groceries"),
    ("Potato Chips", "Groceries"),
    ("Coca Cola 0.5L", "Groceries"),
    ("Woda Żywiec Zdrój", "Groceries"),
    ("Sok pomarańczowy 100%", "Groceries"),
    ("Orange Juice", "Groceries"),
    ("Mineral Water", "Groceries"),
    # --- ALCOHOL AND STIMULANTS ---
    ("Piwo Tyskie 0.5L", "Alcohol and stimulants"),
    ("Wódka Wyborowa", "Alcohol and stimulants"),
    ("Wino czerwone wytrawne", "Alcohol and stimulants"),
    ("Papierosy Marlboro Gold", "Alcohol and stimulants"),
    ("L&M Blue", "Alcohol and stimulants"),
    ("Piwo Żywiec", "Alcohol and stimulants"),
    ("Heineken Beer", "Alcohol and stimulants"),
    ("Vodka Absolut", "Alcohol and stimulants"),
    ("Red Wine Cabernet", "Alcohol and stimulants"),
    ("Marlboro Cigarettes", "Alcohol and stimulants"),
    ("Whisky Jameson", "Alcohol and stimulants"),
    # --- HOUSEHOLD AND CHEMISTRY ---
    ("Domestos 1L", "Household and chemistry"),
    ("Papier toaletowy 8 rolek", "Household and chemistry"),
    ("Płyn do naczyń Ludwik", "Household and chemistry"),
    ("Proszek do prania Vizir", "Household and chemistry"),
    ("Ręcznik papierowy", "Household and chemistry"),
    ("Toilet Paper 12 rolls", "Household and chemistry"),
    ("Dishwashing Liquid", "Household and chemistry"),
    ("Laundry Detergent", "Household and chemistry"),
    ("Paper Towels", "Household and chemistry"),
    ("Bleach", "Household and chemistry"),
    # --- COSMETICS ---
    ("Szampon Head&Shoulders", "Cosmetics"),
    ("Żel pod prysznic Nivea", "Cosmetics"),
    ("Pasta do zębów Colgate", "Cosmetics"),
    ("Dezodorant Rexona", "Cosmetics"),
    ("Shampoo", "Cosmetics"),
    ("Shower Gel", "Cosmetics"),
    ("Toothpaste", "Cosmetics"),
    ("Deodorant Stick", "Cosmetics"),
    ("Face Cream", "Cosmetics"),
    # --- ENTERTAINMENT ---
    ("Bilet do kina", "Entertainment"),
    ("Gra na PS5", "Entertainment"),
    ("Książka", "Entertainment"),
    ("Spotify Premium", "Entertainment"),
    ("Cinema Ticket", "Entertainment"),
    ("Video Game", "Entertainment"),
    ("Book", "Entertainment"),
    ("Netflix Subscription", "Entertainment"),
    ("Concert Ticket", "Entertainment"),
    # --- TAXES AND FEES ---
    ("Service Charge", "Taxes and fees"),
    ("Opłata serwisowa", "Taxes and fees"),
    ("Napiwek", "Taxes and fees"),
    ("Koszt dostawy", "Taxes and fees"),
    ("Delivery Fee", "Taxes and fees"),
    ("Tip", "Taxes and fees"),
    ("Tax", "Taxes and fees"),
    ("Service Fee", "Taxes and fees"),
    # --- TRANSPORT ---
    ("Bilet autobusowy", "Transport"),
    ("Benzyna PB95", "Transport"),
    ("Uber Przejazd", "Transport"),
    ("Bilet PKP", "Transport"),
    ("Bus Ticket", "Transport"),
    ("Gasoline", "Transport"),
    ("Uber Ride", "Transport"),
    ("Train Ticket", "Transport"),
    ("Parking Fee", "Transport"),
    # --- OTHER ---
    ("Torba foliowa", "Other"),
    ("Reklamówka", "Other"),
    ("Plastic Bag", "Other"),
    ("Shopping Bag", "Other"),
    ("Unknown Item", "Other"),
    # --- IGNORE / NOISE (Non-products) ---
    ("Suma", "Ignore"),
    ("Suma PLN", "Ignore"),
    ("Total", "Ignore"),
    ("Total USD", "Ignore"),
    ("Subtotal", "Ignore"),
    ("Podsuma", "Ignore"),
    ("Reszta", "Ignore"),
    ("Change", "Ignore"),
    ("Gotówka", "Ignore"),
    ("Cash", "Ignore"),
    ("Karta płatnicza", "Ignore"),
    ("Credit Card", "Ignore"),
    ("Visa", "Ignore"),
    ("MasterCard", "Ignore"),
    ("NIP 525-000-11-22", "Ignore"),
    ("Tax ID", "Ignore"),
    ("Tel: 22 123 45 67", "Ignore"),
    ("Dziękujemy", "Ignore"),
    ("Thank you", "Ignore"),
    ("Zapraszamy ponownie", "Ignore"),
    ("Visit us again", "Ignore"),
    ("Sprzedaż opodatkowana", "Ignore"),
    ("Taxable amount", "Ignore"),
    ("Stolik 5", "Ignore"),
    ("Table 12", "Ignore"),
    ("Paragon fiskalny", "Ignore"),
    ("Fiscal Receipt", "Ignore"),
]

texts = [x[0] for x in data]
labels = [x[1] for x in data]

dataset = Dataset.from_dict({"text": texts, "label": labels})


def train():
    logger.info("🚀 Pobieram bazowy model (MiniLM)...")
    model = SetFitModel.from_pretrained(
        "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    logger.info("🏋️ Rozpoczynam trening (Fine-Tuning)...")

    trainer = SetFitTrainer(
        model=model,
        train_dataset=dataset,
        # --- POPRAWKA: Przekazujemy klasę, nie stringa ---
        loss_class=CosineSimilarityLoss,
        metric="accuracy",
        batch_size=16,
        num_iterations=20,
        num_epochs=1,
        column_mapping={"text": "text", "label": "label"},
    )

    trainer.train()

    logger.info(f"💾 Zapisuję Twój wytrenowany model do: {OUTPUT_DIR}")
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    model.save_pretrained(str(OUTPUT_DIR))
    logger.info("✅ Gotowe! Możesz używać modelu w categorizer.py")


if __name__ == "__main__":
    train()
