import matplotlib.pyplot as plt
import cv2
import numpy as np
from pathlib import Path


class Visualizer:
    def create_summary(self,
                       original_path: Path,
                       cropped_path: Path,
                       preprocessed_path: Path,
                       items: list,
                       output_path: Path):
        """
        Tworzy grafikę 4-panelową:
        [ Oryginał | Wycięty | OpenCV Magic | Wynik Tekstowy ]
        """

        # Ustawienia wykresu (szeroki format)
        fig, axes = plt.subplots(1, 4, figsize=(24, 8))
        fig.suptitle(f'SmartReceipt Debug: {original_path.name}', fontsize=16)

        # --- 1. Oryginał ---
        if original_path.exists():
            img = cv2.imread(str(original_path))
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Matplotlib woli RGB
            axes[0].imshow(img)
            axes[0].set_title("1. Input (Raw)", fontsize=12, color='blue')
        axes[0].axis('off')

        # --- 2. Wycięty (YOLO) ---
        if cropped_path.exists():
            img = cv2.imread(str(cropped_path))
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            axes[1].imshow(img)
            axes[1].set_title("2. YOLO Crop & Warp", fontsize=12, color='green')
        axes[1].axis('off')

        # --- 3. Preprocessing (OpenCV) ---
        if preprocessed_path.exists():
            # Wczytujemy jako grayscale
            img = cv2.imread(str(preprocessed_path), cv2.IMREAD_GRAYSCALE)
            axes[2].imshow(img, cmap='gray')  # Mapa szarości
            axes[2].set_title("3. OpenCV Magic (Input to OCR)", fontsize=12, color='purple')
        axes[2].axis('off')

        # --- 4. Wyniki (Tekst) ---
        axes[3].axis('off')
        axes[3].set_title("4. Extracted Data (JSON)", fontsize=12, color='red')

        # Budowanie tekstu
        if items:
            lines = [f"{'PRODUKT':<20} | {'CENA'}", "-" * 30]
            for item in items:
                # Skracamy nazwę jeśli za długa
                name = (item['product_name'][:25] + '..') if len(item['product_name']) > 25 else item['product_name']
                lines.append(f"{name:<20} | {item['price']:.2f}")

            text_content = "\n".join(lines)
            col = 'black'
        else:
            text_content = "❌ NO PRODUCTS FOUND\n\nPossible causes:\n- Bad crop\n- OCR failure\n- Regex mismatch"
            col = 'red'

        # Wypisanie tekstu na wykresie
        axes[3].text(0.05, 0.95, text_content,
                     transform=axes[3].transAxes,
                     fontsize=11,
                     verticalalignment='top',
                     fontfamily='monospace',
                     color=col)

        # Zapis do pliku
        plt.tight_layout()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=150)
        plt.close(fig)  # Ważne: zwalnia pamięć