from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Dict, Any


class BaseParser(ABC):
    @abstractmethod
    def parse(self, image_path: Path) -> List[Dict[str, Any]]:
        """
        Parse the receipt image and return a list of extracted items.
        """
        pass


class BaseCategorizer(ABC):
    @abstractmethod
    def categorize_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Categorize the extracted items and return the categorized list.
        """
        pass


class BaseVisualizer(ABC):
    @abstractmethod
    def visualize(
        self,
        original_path: Path,
        raw_items: list,
        final_items: list,
        output_path: Path,
    ) -> Path:
        """
        Visualize the extracted items on the receipt image and return the path to the visualized image.
        """
        pass
