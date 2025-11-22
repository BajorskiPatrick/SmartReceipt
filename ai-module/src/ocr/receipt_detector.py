import cv2
import numpy as np
import pytesseract
from ultralytics import YOLO
from pathlib import Path


class ReceiptDetector:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = Path(__file__).parent / "models/receipt_yolo_best.pt"

        self.model_path = Path(model_path)
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model nie znaleziony w: {self.model_path}. Uruchom najpierw scripts/train_receipt_detector.py"
            )

        # Ładujemy model
        self.model = YOLO(str(self.model_path))

    def _order_points(self, pts):
        """
        Kluczowa funkcja: układa punkty w kolejności:
        [Lewy-Góra, Prawy-Góra, Prawy-Dół, Lewy-Dół]
        """
        rect = np.zeros((4, 2), dtype="float32")

        # Suma współrzędnych (x+y):
        # Najmniejsza suma -> Lewy-Góra (Top-Left)
        # Największa suma -> Prawy-Dół (Bottom-Right)
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        # Różnica współrzędnych (y-x lub x-y):
        # Najmniejsza różnica -> Prawy-Góra (Top-Right)
        # Największa różnica -> Lewy-Dół (Bottom-Left)
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect

    def _four_point_transform(self, image, pts):
        """
        Wykonuje 'Perspective Warp' i automatycznie obraca do pionu.
        """
        rect = self._order_points(pts)
        (tl, tr, br, bl) = rect

        # 1. Obliczamy szerokość (maksymalna odległość między punktami poziomymi)
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))

        # 2. Obliczamy wysokość (maksymalna odległość między punktami pionowymi)
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))

        # 3. Definiujemy punkty docelowe
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]], dtype="float32")

        # 4. Wykonujemy transformację
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

        # 5. --- FIX: WYMUSZENIE PIONU (Portrait Mode) ---
        # Jeśli obraz wyszedł szerszy niż wyższy (leży na boku), obracamy go.
        h, w = warped.shape[:2]
        if w > h:
            warped = cv2.rotate(warped, cv2.ROTATE_90_CLOCKWISE)

        return warped

    def _correct_orientation_osd(self, img):
        """
        Używa Tesseracta, żeby sprawdzić czy paragon nie jest do góry nogami.
        """
        try:
            # Tesseract OSD działa lepiej na większych obrazkach z ramką
            # Dodajemy białą ramkę (border), żeby tekst nie dotykał krawędzi
            img_with_border = cv2.copyMakeBorder(img, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=(255, 255, 255))

            # Ograniczamy wielkość do analizy (dla szybkości)
            h, w = img_with_border.shape[:2]
            scale = max(1, 1000 // max(h, w))
            if scale > 1:
                check_img = cv2.resize(img_with_border, (w * scale, h * scale))
            else:
                check_img = img_with_border

            # Uruchamiamy OSD (Orientation and Script Detection)
            osd = pytesseract.image_to_osd(check_img, config="--dpi 300 --psm 0")

            # Parsujemy wynik
            rotate_angle = int([line for line in osd.split("\n") if "Rotate" in line][0].split(":")[1].strip())

            # Obracamy ORYGINAŁ (bez ramki)
            if rotate_angle == 90:
                return cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            elif rotate_angle == 180:
                return cv2.rotate(img, cv2.ROTATE_180)
            elif rotate_angle == 270:
                return cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

            return img
        except Exception as e:
            # Jeśli OSD zawiedzie (np. mało tekstu), zwracamy oryginał
            # print(f"   ⚠️ OSD Warning: {e}")
            return img

    def process(self, image_path: Path, output_path: Path = None):
        img = cv2.imread(str(image_path))
        if img is None:
            print(f"Nie można załadować: {image_path}")
            return None

        # 1. Inferencja YOLO
        results = self.model(img, verbose=False, conf=0.3, iou=0.5)

        if not results or results[0].obb is None or len(results[0].obb) == 0:
            # Fallback: Jeśli OBB nie zadziała, sprawdź czy zwykły box (xywh) coś złapał
            # (Czasami modele OBB zwracają puste obb ale pełne boxes)
            if results[0].boxes and len(results[0].boxes) > 0:
                # Tu można dodać logikę dla zwykłych boxów, na razie pomijamy
                pass
            print(f"⚠️ Nie wykryto paragonu (OBB) na: {image_path.name}")
            return None

        # 2. Wybór największego paragonu
        all_boxes = results[0].obb.xyxyxyxy.cpu().numpy()
        best_box = None
        max_area = 0

        for box in all_boxes:
            # Obliczamy pole metodą Gaussa (Shoelace formula) dla wielokąta
            # lub prościej: contourArea z OpenCV
            area = cv2.contourArea(box)
            if area > max_area:
                max_area = area
                best_box = box

        if best_box is None:
            return None

        # 3. Prostowanie i Wymuszanie Pionu
        warped = self._four_point_transform(img, best_box)

        # 4. Ostatnia weryfikacja orientacji (Góra/Dół)
        final_img = self._correct_orientation_osd(warped)

        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(output_path), final_img)

        return final_img