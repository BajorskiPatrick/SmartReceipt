import easyocr
from pathlib import Path


def perform_ocr(image_path: Path) -> str:
    """
    Perform OCR on the given image using EasyOCR.

    Args:
        image_path (Path): The path to the image file.

    Returns:
        str: The extracted text from the image.
    """
    reader = easyocr.Reader(["en"])
    result = reader.readtext(str(image_path))
    extracted_text = " ".join([text for _, text, _ in result])
    return extracted_text


if __name__ == "__main__":
    # perform ocr for every file in data folder
    script_directory = Path(__file__).parent.resolve()
    data_folder = script_directory.parent / "data"
    print(f"Looking for image files in: {data_folder}")
    for image_file in data_folder.glob("*.*"):
        print(f"Processing file: {image_file.name}")
        text = perform_ocr(image_file)
        print(f"Extracted text from {image_file.name}:\n{text}\n")
    else:
        print("No image files found in the data/images folder.")
