def test_model_is_real(categorizer):
    """Checks if the model loaded correctly and is not a dummy."""
    assert categorizer.model is not None
    # Ensure it is not a MagicMock (if you use mocks elsewhere)
    assert "MagicMock" not in str(type(categorizer.model))


def test_dictionary_items(categorizer):
    """Tests products that should be caught by the dictionary (quick check)."""
    items = [
        {"productName": "FRANCZAK BUKA"},
        {"productName": "LACIATEHEKOBUTELKA2PEC"},
    ]

    results = categorizer.categorize_items(items)

    assert len(results) == 2
    # Check if category was assigned
    assert results[0]["category"] is not None
    assert results[1]["category"] is not None

    # Optional: check if confidence is high (dictionary is usually 1.0 or certain)
    # assert results[0]['confidence'] > 0.9


def test_ai_prediction_items(categorizer):
    """Tests products requiring AI prediction (outside dictionary)."""
    items = [
        {"productName": "WÓDKA WYBOROWA 0.7"},
        {"productName": "JOGURT NATURALNY EKO"},
    ]

    results = categorizer.categorize_items(items)

    assert len(results) == 2
    assert results[0]["category"] is not None
    assert results[1]["category"] is not None


def test_low_confidence_handling(categorizer):
    """Tests if the system handles nonsense data."""
    items = [{"productName": "TOTALNA BZDURA XYZ 123"}]

    results = categorizer.categorize_items(items)

    # Check response structure
    assert "category" in results[0]
    assert "confidence" in results[0]

    # If your logic returns None for low score, uncomment:
    # assert results[0]['category'] is None


def test_batch_processing(categorizer):
    """Checks if the function handles a mixed list."""
    products = ["CHLEB", "MASLO", "MLEKO", "WODA", "PIWO"]
    items = [{"productName": p} for p in products]

    results = categorizer.categorize_items(items)

    assert len(results) == 5
    for res in results:
        assert "category" in res
