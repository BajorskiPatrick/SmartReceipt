import cv2
import re
from pathlib import Path
# Importujemy nasze nowe moduły
from src.ocr.image_preprocessor import ImagePreprocessor
from src.ocr.text_extractor import TextExtractor


class ReceiptParser:
    def __init__(self):
        self.preprocessor = ImagePreprocessor()
        self.extractor = TextExtractor(lang='pl')  # EasyOCR obsługuje PL i ENG domyślnie razem

        # Słowa zakazane (Nagłówki, sumy, podatki)
        # CORD zawiera mix indonezyjskiego i angielskiego
        self.blacklist = [
            'SUMA', 'RAZEM', 'TOTAL', 'SUBTOTAL', 'SUB', 'NETTO', 'BRUTTO',
            'PTU', 'VAT', 'TAX', 'PAJAK', 'RESTO', 'SERVICE', 'CHARGE',
            'DATA', 'DATE', 'NIP', 'REGON', 'TRANSAKCJA', 'PARAGON', 'RECEIPT',
            'KARTA', 'CARD', 'GOTÓWKA', 'CASH', 'TUNAI', 'KEMBALI', 'CHANGE',
            'SPRZEDAŻ', 'RABAT', 'DISCOUNT', 'JUMLAH', 'ITEM', 'QTY'
        ]

        # Regex na cenę (łapie formaty: 10.00, 10,00, 1.000, 45,000)
        self.price_pattern = re.compile(r'(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*([A-Z]{1,3}|PLN|RP)?$',
                                        re.IGNORECASE)

    def _parse_price_str(self, price_str: str) -> float:
        """Zamienia string '46,363' lub '10.99' na float"""
        try:
            # Usuwamy separatory tysięcy i robimy standardowy float
            # Heurystyka: Jeśli są 3 cyfry po przecinku/kropce (np 46,363), to w CORD to zazwyczaj tysiące.
            if ',' in price_str and '.' in price_str:
                # Format 1.234,56 -> usun kropki, zamien przecinek na kropke
                clean = price_str.replace('.', '').replace(',', '.')
            elif ',' in price_str:
                parts = price_str.split(',')
                if len(parts[-1]) == 3:  # Traktuj jako tysiące (46,000 -> 46000.0)
                    clean = price_str.replace(',', '')
                else:  # Traktuj jako grosze (10,99 -> 10.99)
                    clean = price_str.replace(',', '.')
            else:
                clean = price_str

            return float(clean)
        except ValueError:
            return None

    def parse(self, image_path: Path, debug_dir: Path = None) -> list[dict]:
        print(f"   🔍 Analizuję: {image_path.name}")

        # 1. Ładowanie
        img = cv2.imread(str(image_path))
        if img is None:
            print(f"❌ Nie można otworzyć: {image_path}")
            return []

        # 2. Preprocessing (Moduł 1)
        processed_img = self.preprocessor.preprocess(img)

        if debug_dir:
            cv2.imwrite(str(debug_dir / f"ocr_input_{image_path.name}"), processed_img)

        # 3. Ekstrakcja Linii (Moduł 2)
        lines = self.extractor.extract_lines(processed_img, y_tolerance=20)

        parsed_items = []

        # 4. Parsowanie (Logika)
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            i += 1

            # Filtry wstępne
            if len(line) < 3: continue
            if any(bw in line.upper() for bw in self.blacklist): continue

            # Szukamy ceny w tej linii
            price_match = self.price_pattern.search(line)
            price = None
            name = ""

            if price_match:
                # Scenariusz A: Cena w tej samej linii (np. "MLEKO 2.99")
                raw_price = price_match.group(1)
                price = self._parse_price_str(raw_price)
                name = line[:price_match.start()].strip()

            # Scenariusz B: Lookahead (Cena spadła do nowej linii)
            elif i < len(lines):
                next_line = lines[i].strip()
                # Sprawdź czy następna linia to SAMO "kwota"
                next_match = self.price_pattern.search(next_line)
                # Warunek: następna linia musi być krótka i wyglądać jak liczba
                if next_match and len(next_line) < 15:
                    potential_price = self._parse_price_str(next_match.group(1))
                    if potential_price:
                        price = potential_price
                        name = line  # Cała obecna linia to nazwa
                        i += 1  # Przeskakujemy linię z ceną

            # Finalna weryfikacja produktu
            if price and len(name) > 2:
                # Czyścimy nazwę ze śmieci na początku ("1. ", "A ")
                name = re.sub(r'^[\d\.\)\-\sxX]+', '', name)

                # Ignorujemy jeśli nazwa to same cyfry (np. kod produktu)
                if not name.replace('.', '').replace(' ', '').isdigit():
                    # Odrzucamy ceny zerowe lub ekstremalne
                    if 0.01 < price < 1000000:
                        parsed_items.append({
                            "product_name": name,
                            "price": price
                        })

        return parsed_items