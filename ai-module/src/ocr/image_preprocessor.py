import cv2
import numpy as np

class ImagePreprocessor:
    def preprocess(self, img: np.ndarray) -> np.ndarray:
        """
        Pipeline: Grayscale -> Upscale -> Bilateral Filter -> CLAHE -> Morphology
        """
        if img is None:
            raise ValueError("Image is None")

        # 1. Skala szarości
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        # 2. Upscaling (2x) - Kluczowe dla małych fontów
        # INTER_LANCZOS4 daje najlepszą ostrość przy powiększaniu
        scaled = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_LANCZOS4)

        # 3. Odszumianie z zachowaniem krawędzi (Bilateral Filter)
        # Usuwa ziarno papieru, ale nie rozmywa liter
        denoised = cv2.bilateralFilter(scaled, 11, 17, 17)

        # 4. CLAHE (Inteligentny kontrast)
        # Zwiększamy clipLimit do 4.0 dla mocniejszego efektu
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
        contrasted = clahe.apply(denoised)

        # 5. Morfologia (Opcjonalnie - zamykanie dziur w literach)
        # Pomaga na "kropkowane" wydruki termiczne
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        closed = cv2.morphologyEx(contrasted, cv2.MORPH_CLOSE, kernel)

        # 6. Wyostrzanie (Unsharp Masking)
        gaussian = cv2.GaussianBlur(closed, (0, 0), 3.0)
        unsharp_image = cv2.addWeighted(closed, 1.5, gaussian, -0.5, 0, closed)

        return unsharp_image