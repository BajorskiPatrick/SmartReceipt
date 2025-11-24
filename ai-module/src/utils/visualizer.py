import matplotlib.pyplot as plt
import cv2
from pathlib import Path


class Visualizer:
    def create_summary(self,
                       original_path: Path,
                       cropped_path: Path,
                       items: list,
                       output_path: Path):

        fig, axes = plt.subplots(1, 3, figsize=(20, 8))
        fig.suptitle(f'SmartReceipt: {original_path.name}', fontsize=16)

        # 1. Oryginał
        if original_path.exists():
            img = cv2.imread(str(original_path))
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                axes[0].imshow(img)
                axes[0].set_title("1. Raw Input", fontsize=12)
        axes[0].axis('off')

        # 2. Crop
        if cropped_path.exists():
            img = cv2.imread(str(cropped_path))
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                axes[1].imshow(img)
                axes[1].set_title("2. Donut Input (Crop)", fontsize=12)
        axes[1].axis('off')

        # 3. Wyniki
        axes[2].axis('off')
        axes[2].set_title("3. Extracted Data", fontsize=12)

        if items:
            lines = [f"{'PRODUKT':<15} | {'CENA':>6} | {'KATEGORIA'}", "-" * 45]
            for item in items:
                name = (item['product_name'][:15] + '..') if len(item['product_name']) > 15 else item['product_name']
                price = item['price']
                cat = item.get('category', '---')
                conf = item.get('category_conf', 0.0)

                # Formatowanie CORD (tysiące bez przecinków)
                lines.append(f"{name:<15} | {price:>6.0f} | {cat}")

            text_content = "\n".join(lines)
            col = 'black'
        else:
            # FIX: Zmiana emotki na tekst, żeby matplotlib nie krzyczał o czcionkę
            text_content = "[!] NO PRODUCTS FOUND\n\n(Receipt might be empty\nor failed to parse)"
            col = 'red'

        axes[2].text(0.05, 0.95, text_content,
                     transform=axes[2].transAxes,
                     fontsize=11,
                     verticalalignment='top',
                     fontfamily='monospace',
                     color=col)

        plt.tight_layout()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=150)
        plt.close(fig)