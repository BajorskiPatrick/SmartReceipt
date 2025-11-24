import cv2
import numpy as np
from scipy.ndimage import rotate


class ImagePreprocessor:
    def preprocess(self, img: np.ndarray) -> np.ndarray:
        """
        Pipeline: Deskew -> Grayscale -> Upscale -> Gamma Correction -> CLAHE -> Denoise
        UWAGA: Zwracamy obraz w odcieniach szarości (nie binarny!), bo OCR sieciowy (EasyOCR/Paddle)
        potrzebuje informacji o cieniach/krawędziach liter.
        """
        if img is None:
            raise ValueError("Image is None")

        # 1. Prostowanie precyzyjne (Fine Deskew) - naprawia to, czego YOLO nie wyprostowało
        img = self.deskew_text(img)

        # 2. Skala szarości
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        # 3. Upscaling (2x)
        # Zwiększamy obraz, bo EasyOCR gubi się na małym druczku
        scaled = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_LANCZOS4)

        # 4. Korekcja Gamma (Ratunek dla wyblakłych paragonów)
        # gamma < 1.0 rozjaśnia, gamma > 1.0 przyciemnia.
        # My chcemy "rozciągnąć" ciemne kolory (tusz), żeby stały się wyraźniejsze.
        gamma = 0.8  # Eksperymentalne: 0.8 - 1.2
        # Budujemy tablicę lookup table dla szybkości
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        gamma_corrected = cv2.LUT(scaled, table)

        # 5. Odszumianie (Bilateral Filter)
        # Usuwa szum matrycy/papieru, ale zachowuje krawędzie liter
        denoised = cv2.bilateralFilter(gamma_corrected, 9, 75, 75)

        # 6. CLAHE (Lokalny kontrast)
        # To jest najważniejsze dla paragonów z cieniami
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        contrasted = clahe.apply(denoised)

        # 7. Wyostrzanie (Unsharp Masking) - delikatne
        gaussian = cv2.GaussianBlur(contrasted, (0, 0), 3.0)
        unsharp = cv2.addWeighted(contrasted, 1.5, gaussian, -0.5, 0, contrasted)

        # NIE ROBIMY BINARYZACJI (Thresholding).
        # EasyOCR lepiej radzi sobie na grayscale niż na "postrzępionym" obrazie 1-bitowym.
        return unsharp

    def deskew_text(self, image):
        """
        Algorytm prostowania tekstu oparty na projekcji poziomej.
        Sprawdza kąty od -5 do +5 stopni i wybiera ten, gdzie linie tekstu są "najostrzejsze".
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Odwracamy kolory (tekst ma być biały na czarnym do obliczeń)
        bitwise_not = cv2.bitwise_not(gray)

        # Binaryzacja tylko na potrzeby wykrycia kąta (nie zwracamy tego obrazu)
        thresh = cv2.threshold(bitwise_not, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

        # Pobieramy współrzędne wszystkich pikseli tekstu
        coords = np.column_stack(np.where(thresh > 0))

        # minAreaRect znajduje prostokąt obejmujący wszystkie punkty tekstu
        angle = cv2.minAreaRect(coords)[-1]

        # Poprawka kąta (OpenCV zwraca dziwne wartości dla minAreaRect)
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # Jeśli kąt jest duży (np. YOLO nawaliło i dało poziomy obraz), ignorujemy
        # Nas interesuje tylko precyzyjna korekta +/- 5 stopni
        if abs(angle) > 10:
            # Metoda 2: Projection Profile (bardziej skomplikowana, ale tu fallback)
            # Na razie zostawmy 0, bo minAreaRect mogło zwariować na śmieciach
            return image

        # Rotacja
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        return rotated