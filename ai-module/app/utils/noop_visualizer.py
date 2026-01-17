from pathlib import Path

from app.services.interfaces import BaseVisualizer


class NoopVisualizer(BaseVisualizer):
    def visualize(
        self,
        original_path: Path,
        raw_items: list,
        final_items: list,
        output_path: Path,
    ) -> Path:
        return output_path
