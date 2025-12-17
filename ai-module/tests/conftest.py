import sys
import pytest
import asyncio
import os
from pathlib import Path

# --- 1. KONFIGURACJA ŚCIEŻEK ---
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

# Wymuszamy CPU dla testów (chyba że ktoś bardzo chce GPU)
if "SR_GPU_LAYERS" not in os.environ:
    os.environ["SR_GPU_LAYERS"] = "0"

# --- 2. IMPORTY ---

from app.nlp.categorizer import ProductCategorizer
from app.services.inference_service import InferenceService
from app.ocr.llm_parser import LLMReceiptParser
from app.utils.visualizer import Visualizer

# --- 3. FIXTURES ---

@pytest.fixture(scope="module")
def categorizer():
    """Inicjalizuje sam model kategoryzacji (lekki)."""
    print("\n⏳ [Fixture] Ładowanie ProductCategorizer...")
    return ProductCategorizer()

@pytest.fixture(scope="module")
def inference_service():
    """
    Inicjalizuje CAŁY serwis (OCR + NLP + Visualizer).
    To jest ciężka operacja, więc robimy to raz na moduł (scope="module").
    """
    print("\n⏳ [Fixture] Ładowanie InferenceService (OCR + NLP)... to może chwilę potrwać.")
    try:
        parser = LLMReceiptParser()
        categorizer = ProductCategorizer()
        visualizer = Visualizer()

        service = InferenceService(
            parser=parser,
            categorizer=categorizer,
            visualizer=visualizer
        )
        return service
    except Exception as e:
        pytest.fail(f"Nie udało się zainicjalizować serwisu: {e}")

@pytest.fixture(scope="session")
def event_loop():
    """
    Wymagane dla testów asynchronicznych w pytest,
    aby fixture'y o zasięgu 'module' działały poprawnie z async.
    """
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
