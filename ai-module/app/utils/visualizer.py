import matplotlib.pyplot as plt
import cv2
import json
from pathlib import Path
from app.services.interfaces import BaseVisualizer


class Visualizer(BaseVisualizer):
    def visualize(
        self,
        original_path: Path,
        raw_items: list,
        final_items: list,
        output_path: Path,
    ):
        """
        Creates a 4-panel debug image:
        [ Original | YOLO Crop | Donut Raw JSON | Final Categorized ]
        """
        fig, axes = plt.subplots(1, 4, figsize=(24, 10))
        fig.suptitle(f"SmartReceipt Debug: {original_path.name}", fontsize=16)

        # --- 1. Original Image ---
        if original_path.exists():
            img = cv2.imread(str(original_path))
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                axes[0].imshow(img)
                axes[0].set_title("1. Input (Raw)", fontsize=12, color="blue")
        axes[0].axis("off")

        axes[1].text(0.5, 0.5, "No Crop (Using Original)", ha="center")
        axes[1].axis("off")

        # Parser result
        axes[2].axis("off")
        axes[2].set_title("Parser result", fontsize=12, color="purple")

        # Format JSON for display
        raw_text = json.dumps(raw_items, indent=2, ensure_ascii=False)
        # Truncate if too long
        if len(raw_text) > 1500:
            raw_text = raw_text[:1500] + "\n... (truncated)"

        axes[2].text(
            0.05,
            0.95,
            raw_text,
            transform=axes[2].transAxes,
            fontsize=9,
            verticalalignment="top",
            fontfamily="monospace",
            wrap=True,
        )

        axes[3].axis("off")
        axes[3].set_title("4. Categorized & Parsed", fontsize=12, color="red")

        if final_items:
            lines = [f"{'PRODUCT':<20} | {'PRICE':>6} | {'CATEGORY'}", "-" * 50]
            for item in final_items:
                name = item.get("productName", "??")
                name = (name[:18] + "..") if len(name) > 18 else name
                price = item.get("price", 0.0)
                cat = item.get("category", "None")
                lines.append(f"{name:<20} | {price:>6.2f} | {cat}")

            text_content = "\n".join(lines)
        else:
            text_content = "NO ITEMS FOUND"

        axes[3].text(
            0.05,
            0.95,
            text_content,
            transform=axes[3].transAxes,
            fontsize=10,
            verticalalignment="top",
            fontfamily="monospace",
        )

        # Save
        plt.tight_layout()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=100)
        plt.close(fig)
