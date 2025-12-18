from setfit import SetFitModel
from pathlib import Path
from app.utils.logger import get_logger
from app.services.interfaces import BaseCategorizer

logger = get_logger("ProductCategorizer")


class ProductCategorizer(BaseCategorizer):
    CONFIDENCE_THRESHOLD = 0.6

    # Wklej to do swojej klasy ProductCategorizer

    KEYWORDS = {
        "Alcohol and stimulants": [
            "PIWO",
            "WÓDKA",
            "WODKA",
            "WINO",
            "WHISKY",
            "SPIRYTUS",
            "LIKIER",
            "PAPIEROSY",
            "TYTOŃ",
            "TYTON",
            "L&M",
            "MARLBORO",
            "CAMEL",
            "HEETS",
            "VUSE",
        ],
        "Groceries": [
            # Pieczywo
            "BUŁKA",
            "BULKA",
            "BUKA",
            "CHLEB",
            "KAIZERKA",
            "ROGAL",
            "BAGIETKA",
            "TORTILLA",
            # Nabiał (Tutaj naprawiamy LACIATE i TWAROZEK)
            "MLEKO",
            "LACIATE",
            "ŁACIATE",
            "SER",
            "JOGURT",
            "KEFIR",
            "MASŁO",
            "MASLO",
            "TWARÓG",
            "TWAROG",
            "TWAROZEK",
            "ŚMIETANA",
            "SMIETANA",
            "DAN CAKE",
            # Jaja (Naprawiamy Transport Jaj xD)
            "JAJA",
            "JAJKA",
            "ZIELONONOZKA",
            "ZIELONONÓŻKA",
            # Mięso i wędliny (Naprawiamy OPATKA i MIERNIK PIECZEN)
            "SZYNKA",
            "SCHAB",
            "KIEŁBASA",
            "KIELBASA",
            "PIERŚ",
            "KURCZAK",
            "INDYK",
            "MIESO",
            "MIĘSO",
            "ŁOPATKA",
            "LOPATKA",
            "OPATKA",
            "PIECZEŃ",
            "PIECZEN",
            "ZRAZOWA",
            # Warzywa i Przetwory (Naprawiamy Passatę i Knorra)
            "POMIDOR",
            "OGÓREK",
            "ZIEMNIAK",
            "MARCHEW",
            "PASSATA",
            "PRZECIER",
            "ROSÓŁ",
            "ROSOL",
            "KNORR",
            "WINIARY",
            "PRZYPRAWA",
            "KAMIS",
            "SOS",
            # Napoje
            "WODA",
            "NAPÓJ",
            "SOK",
            "NEKTAR",
            "PEPSI",
            "COLA",
            "SPRITE",
        ],
        "Household and chemistry": [
            "DOMESTOS",
            "PŁYN",
            "PLYN",
            "PROSZEK",
            "KAPSUŁKI",
            "KAPSULKI",
            "BATERIE",
            "WORKI",
            "PAPIER TOALETOWY",
            "RECZNIK",
            "CHUSTECZKI",
            "MYDŁO",
            "TORBA",
            "REKLAMÓWKA",
            "SIATKA",
        ],
        "Transport": [
            "BILET",
            "PALIWO",
            "PB95",
            "ON",
            "UBER",
            "BOLT",
            "PARKING",
            "MPK",
            "PKP",
        ],
        # Torby papierowe możesz dodać do Ignore albo zostawić w Household
    }

    def __init__(self):
        self.model_path = Path(__file__).parent / "models/my-receipt-categorizer"

        logger.info("Loading SetFit model...")

        if self.model_path.exists():
            # force model to use cpu for llama resource optimization
            self.model = SetFitModel.from_pretrained(str(self.model_path), device="cpu")

            # if torch.cuda.is_available():
            #     self.model.to("cuda")
            logger.info(f"Categorizer uses device: {str(self.model.device)}")
        else:
            logger.error(f"Error: SetFit model not found at {self.model_path}")
            raise FileNotFoundError("SetFit model not found.")

    def _check_keywords(self, product_name: str) -> str | None:
        """Pomocnicza funkcja do sprawdzania słów kluczowych"""
        name_upper = product_name.upper()
        for category, words in self.KEYWORDS.items():
            if any(word in name_upper for word in words):
                return category
        return None

    def categorize(self, productName: str) -> dict:
        """
        Klasyfikuje pojedynczy produkt (wrapper dla spójności)
        """
        # Używamy logiki z categorize_items dla pojedynczego elementu
        items = [{"productName": productName}]
        result = self.categorize_items(items)
        item = result[0]
        # Zwracamy w starym formacie oczekiwanym przez metodę categorize
        return {
            "category": item["category"],
            "confidence": 1.0 if item["category"] else 0.0,
        }

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

            # 1. Najpierw SPRAWDŹ SŁOWNIK (Priorytet nad AI dla pewniaków)
            # Dzięki temu "BUKA" zawsze wpadnie do Groceries, nieważne co myśli AI
            keyword_category = self._check_keywords(name)

            if keyword_category:
                item["category"] = keyword_category
                item["confidence"] = 1.0
                # Opcjonalnie: loguj, jeśli AI się myliło
                # if ai_category != keyword_category:
                #     logger.info(f"Fixed AI error: {name} | AI: {ai_category} -> KW: {keyword_category}")
                continue

            # 2. Jeśli słownik milczy, ufamy AI (ale tylko jeśli pewne)
            if ai_category != "Ignore" and conf >= self.CONFIDENCE_THRESHOLD:
                item["category"] = ai_category
            else:
                item["category"] = None  # Brak w słowniku i słabe AI

            item["confidence"] = conf

        return items
