import pytest
import io
from pathlib import Path
from fastapi import UploadFile

# Ścieżka do folderu z danymi testowymi
DATA_DIR = Path(__file__).parent / "data"


def get_image_files():
    """Pomocnicza funkcja zwracająca listę plików obrazów."""
    if not DATA_DIR.exists():
        return []
    return [
        f for f in DATA_DIR.glob("*") if f.suffix.lower() in [".jpg", ".jpeg", ".png"]
    ]


# Pobieramy listę plików, żeby sparametryzować test (uruchomi się osobno dla każdego pliku)
image_files = get_image_files()


@pytest.mark.asyncio
@pytest.mark.skipif(len(image_files) == 0, reason="Brak plików w tests/data")
@pytest.mark.parametrize("file_path", image_files)
async def test_full_inference_process(inference_service, file_path):
    """
    Test integracyjny: Przetwarza prawdziwy plik przez OCR -> NLP -> JSON.
    """
    print(f"\n📸 Przetwarzanie pliku: {file_path.name}")

    # Symulacja uploadu pliku w FastAPI
    with open(file_path, "rb") as f:
        content = f.read()
        file_obj = io.BytesIO(content)
        upload_file = UploadFile(file=file_obj, filename=file_path.name)

        try:
            # Wywołanie głównej logiki serwisu
            result = await inference_service.process_receipt(upload_file)

            # --- ASERCJE (Sprawdzamy czy wynik ma sens) ---

            # 1. Czy wynik jest słownikiem?
            assert isinstance(result, dict)

            # 2. Czy zawiera kluczowe pola?
            assert "receipt_id" in result
            assert "items" in result
            assert "summary" in result

            # 3. Czy wykryto jakiekolwiek produkty? (Ostrzeżenie zamiast błędu, bo paragon może być nieczytelny)
            if not result["items"]:
                print(f"⚠️ Ostrzeżenie: Nie wykryto produktów na {file_path.name}")
            else:
                # Sprawdź strukturę pierwszego produktu
                first_item = result["items"][0]
                assert "productName" in first_item
                assert "category" in first_item
                print(
                    f"✅ Wykryto {len(result['items'])} produktów. Pierwszy: {first_item['productName']} -> {first_item['category']}"
                )

        finally:
            await upload_file.close()
