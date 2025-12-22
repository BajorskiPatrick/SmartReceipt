import pytest
import io
from pathlib import Path
from fastapi import UploadFile

# Path to the test data folder
DATA_DIR = Path(__file__).parent / "data"


def get_image_files():
    """Helper function returning a list of image files."""
    if not DATA_DIR.exists():
        return []
    return [
        f for f in DATA_DIR.glob("*") if f.suffix.lower() in [".jpg", ".jpeg", ".png"]
    ]


# Get list of files to parametrize the test (runs separately for each file)
image_files = get_image_files()


@pytest.mark.asyncio
@pytest.mark.skipif(len(image_files) == 0, reason="No files in tests/data")
@pytest.mark.parametrize("file_path", image_files)
async def test_full_inference_process(inference_service, file_path):
    """
    Integration test: Processes a real file through OCR -> NLP -> JSON.
    """
    print(f"\n📸 Processing file: {file_path.name}")

    # Simulation of file upload in FastAPI
    with open(file_path, "rb") as f:
        content = f.read()
        file_obj = io.BytesIO(content)
        upload_file = UploadFile(file=file_obj, filename=file_path.name)

        try:
            # Call main service logic
            result = await inference_service.process_receipt(upload_file)

            # --- ASSERTIONS (Check if result makes sense) ---

            # 1. Is the result a dictionary?
            assert isinstance(result, dict)

            # 2. Does it contain key fields?
            assert "receipt_id" in result
            assert "items" in result
            assert "summary" in result

            # 3. Were any products detected? (Warning instead of error, as receipt might be unreadable)
            if not result["items"]:
                print(f"⚠️ Warning: No products detected on {file_path.name}")
            else:
                # Check structure of the first product
                first_item = result["items"][0]
                assert "productName" in first_item
                assert "category" in first_item
                print(
                    f"✅ Detected {len(result['items'])} products. First: {first_item['productName']} -> {first_item['category']}"
                )

        finally:
            await upload_file.close()
