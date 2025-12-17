import pytest

def test_model_is_real(categorizer):
    """Sprawdza, czy model załadował się poprawnie i nie jest atrapą."""
    assert categorizer.model is not None
    # Upewniamy się, że to nie jest MagicMock (jeśli używasz mocków w innych miejscach)
    assert "MagicMock" not in str(type(categorizer.model))

def test_dictionary_items(categorizer):
    """Testuje produkty, które powinny być wyłapane przez słownik (szybkie sprawdzenie)."""
    items = [
        {"productName": "FRANCZAK BUKA"},
        {"productName": "LACIATEHEKOBUTELKA2PEC"}
    ]

    results = categorizer.categorize_items(items)

    assert len(results) == 2
    # Sprawdzamy czy kategoria została przydzielona
    assert results[0]['category'] is not None
    assert results[1]['category'] is not None

    # Opcjonalnie: sprawdź czy confidence jest wysokie (słownik to zazwyczaj 1.0 lub pewniak)
    # assert results[0]['confidence'] > 0.9

def test_ai_prediction_items(categorizer):
    """Testuje produkty wymagające predykcji AI (spoza słownika)."""
    items = [
        {"productName": "WÓDKA WYBOROWA 0.7"},
        {"productName": "JOGURT NATURALNY EKO"}
    ]

    results = categorizer.categorize_items(items)

    assert len(results) == 2
    assert results[0]['category'] is not None
    assert results[1]['category'] is not None

def test_low_confidence_handling(categorizer):
    """Testuje, czy system radzi sobie z bzdurnymi danymi."""
    items = [{"productName": "TOTALNA BZDURA XYZ 123"}]

    results = categorizer.categorize_items(items)

    # Sprawdzamy strukturę odpowiedzi
    assert "category" in results[0]
    assert "confidence" in results[0]

    # Jeśli Twoja logika zwraca None dla niskiego score, odkomentuj:
    # assert results[0]['category'] is None

def test_batch_processing(categorizer):
    """Sprawdza czy funkcja radzi sobie z listą mieszaną."""
    products = ["CHLEB", "MASLO", "MLEKO", "WODA", "PIWO"]
    items = [{"productName": p} for p in products]

    results = categorizer.categorize_items(items)

    assert len(results) == 5
    for res in results:
        assert "category" in res

