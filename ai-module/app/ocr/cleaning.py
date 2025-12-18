import re


def clean_items(items: list[dict]) -> list[dict]:
    clean_items = []

    BLACKLIST = [
        "OBNIZKA",
        "RABAT",
        "PROMOCJA",
        "GRATIS",
        "ZYSKUJESZ",
        "SUMA",
        "PODSUMOWANIE",
        "RAZEM",
        "DO ZAPŁATY",
        "DO ZAPLATY",
        "DOZAPLATY",
        "PŁATNOŚĆ",
        "PLATNOSC",
        "RESZTA",
        "KARTA",
        "GOTÓWKA",
        "GOTOWKA",
        "ROZLICZENIE",
        "ROZLICZEE",
        "WALUTA",
        "KREDYT",
        "PLN",
        "FISKALNY",
        "NIEFISKALNY",
        "PTU",
        "VAT",
        "NETTO",
        "BRUTTO",
        "OPODATKOWANA",
        "STAWKA",
        "PODATEK",
        "KWOTA",
        "NIP",
        "REGON",
        "BDO",
        "ADRES",
        "UL.",
        "ULICA",
        "SPÓŁKA",
        "SPOLKA",
        "SPOTKA",
        "TOWA",
        "KOUANDY",
        "SPRZEDAZ",
        "SPRZEDAŻ",
        "DATA",
        "GODZINA",
        "NR SYS",
        "PARAGON",
        "KASJER",
        "KASA",
        "WYDRUK",
        "HANDLOWA",
        "SKLEP",
        "FIRMA",
        "EAG",
        "F200",
    ]

    date_pattern = re.compile(r"\d{2}[-.]\d{2}[-.]\d{2,4}")
    time_pattern = re.compile(r"\d{2}:\d{2}")
    trash_tail_pattern = re.compile(r"(\*|\s\d+[\s]?szt|\s\d+[\s]?kg).*", re.IGNORECASE)

    for item in items:
        name = item.get("productName", "Nieznany")
        name_upper = name.upper()

        if any(bad_word in name_upper for bad_word in BLACKLIST):
            continue

        if len(name) > 20 and " " not in name:
            continue

        if date_pattern.search(name) or time_pattern.search(name):
            continue

        if len(name) < 3:
            continue

        if name.replace(".", "").replace(",", "").replace(" ", "").isdigit():
            continue

        price_raw = item.get("price", 0.0)
        price = 0.0

        if isinstance(price_raw, (int, float)):
            price = float(price_raw)
        elif isinstance(price_raw, str):
            try:
                found_prices = re.findall(r"\d+[.,]\d{2}", price_raw.replace(",", "."))
                if found_prices:
                    price = float(found_prices[-1])
                else:
                    clean_str = (
                        price_raw.replace(",", ".")
                        .replace("zł", "")
                        .replace("PLN", "")
                        .strip()
                    )
                    price = float(clean_str)
            except ValueError:
                price = 0.0

        quantity = item.get("quantity", 1.0)

        if price <= 0.01:
            continue
        if price > 2000.0:
            continue

        name = trash_tail_pattern.sub("", name)
        name = re.sub(r"\s+[A-Z0-9]$", "", name)
        name = name.lstrip(".,-* ")

        if not name.strip():
            continue

        clean_items.append(
            {"productName": name.strip(), "price": price, "quantity": quantity}
        )

    return clean_items


def clean_raw_text(raw_text: str) -> str:
    lines = raw_text.split("\n")
    filtered_lines = []

    GARBAGE_MARKERS = [
        "NIP",
        "REGON",
        "BDO",
        "SPÓŁKA",
        "SPOLKA",
        "ADRES:",
        "UL.",
        "PARAGON FISKALNY",
        "F20",
        "EAG",
        "SPRZEDAZ",
        "SPRZEDAŻ",
        "OPODATKOWANA",
        "PTU",
        "PODATEK",
        "NETTO",
        "BRUTTO",
        "KWOTA",
        "ROZLICZENIE",
        "PLATNOSC",
        "PŁATNOŚĆ",
        "GOTÓWKA",
        "KARTA",
        "RESZTA",
        "SUMA:",
        "DO ZAPLATY",
        "DO ZAPŁATY",
        "DOZAPLATY",
        "RAZEM",
        "NR SYS",
        "KASJER",
        "WYDRUK",
        "DATA",
        "GODZINA",
        "PLN",
        "EUR",
        "WALUTA",
        "KREDYT",
    ]

    for line in lines:
        line_clean = line.strip()
        line_upper = line_clean.upper()

        if any(marker in line_upper for marker in GARBAGE_MARKERS):
            continue

        if len(line_clean) < 3:
            continue

        if re.search(r"\d{2}[-.]\d{2}[-.]\d{2,4}", line_clean):
            continue

        if re.match(r"^[\d.,\s]+[A-Za-z]?$", line_clean):
            continue

        if len(line_clean) > 20 and " " not in line_clean:
            continue

        filtered_lines.append(line)

    return "\n".join(filtered_lines)
