from doctr.io import DocumentFile
from doctr.models import ocr_predictor
import numpy as np
import cv2

class TextExtractor:
    def __init__(self, lang='pl'):
        print(f"   ⏳ Inicjalizacja DocTR ({lang})...")
        # pretrained=True pobiera modele. assume_straight_pages=False włącza prostowanie.
        self.model = ocr_predictor(det_arch='db_resnet50', reco_arch='crnn_vgg16_bn', pretrained=True)

    def extract_lines(self, img: np.ndarray, y_tolerance=None) -> list[str]:
        # Doctr oczekuje listy obrazów w formacie (H, W, C) i wartościach 0-255
        # Jeśli img jest grayscale, trzeba dodać wymiar kanału
        if len(img.shape) == 2:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        else:
            img_rgb = img

        # Inferencja
        result = self.model([img_rgb])

        # Parsowanie wyniku (DocTR ma strukturę: Page -> Block -> Line -> Word)
        lines_text = []
        json_output = result.export()
        print(json_output)
        for page in json_output['pages']:
            for block in page['blocks']:
                for line in block['lines']:
                    # Sklejanie słów w linii
                    text = " ".join([word['value'] for word in line['words']])
                    if text.strip():
                        lines_text.append(text)

        return lines_text