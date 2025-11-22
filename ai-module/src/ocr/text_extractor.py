import easyocr
import numpy as np
import logging

logging.getLogger("easyocr").setLevel(logging.WARNING)


class TextExtractor:
    def __init__(self, lang='pl'):
        print(f"   ⏳ Inicjalizacja EasyOCR ({lang})...")
        self.reader = easyocr.Reader([lang], gpu=True)

    def extract_lines(self, img: np.ndarray, y_tolerance=25) -> list[str]:
        """
        Zwraca listę sklejonych linii tekstu.
        """
        try:
            # detail=1 -> Zwraca bbox, tekst, pewność
            results = self.reader.readtext(img, detail=1, paragraph=False)
        except Exception as e:
            print(f"   ⚠️ EasyOCR error: {e}")
            return []

        if not results:
            return []

        # Sortujemy boxy od góry do dołu
        sorted_boxes = sorted(results, key=lambda r: (r[0][0][1] + r[0][2][1]) / 2)

        lines = []
        current_line_boxes = []
        current_y_avg = -1

        for box, text, conf in sorted_boxes:
            # Środek wysokości danego słowa
            mid_y = (box[0][1] + box[2][1]) / 2

            if current_y_avg == -1:
                current_y_avg = mid_y
                current_line_boxes.append((box, text))
            elif abs(mid_y - current_y_avg) <= y_tolerance:
                current_line_boxes.append((box, text))
                # Aktualizacja średniej Y linii
                current_y_avg = (current_y_avg * (len(current_line_boxes) - 1) + mid_y) / len(current_line_boxes)
            else:
                # Zapisz starą linię
                current_line_boxes.sort(key=lambda r: r[0][0][0])  # Sortuj od lewej
                lines.append(" ".join([item[1] for item in current_line_boxes]))

                # Zacznij nową
                current_line_boxes = [(box, text)]
                current_y_avg = mid_y

        # Dodaj ostatnią linię
        if current_line_boxes:
            current_line_boxes.sort(key=lambda r: r[0][0][0])
            lines.append(" ".join([item[1] for item in current_line_boxes]))

        return lines