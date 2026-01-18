import sys
import pytest
import asyncio
import os
from pathlib import Path
from app.nlp.categorizer import ProductCategorizer
from app.services.inference_service import InferenceService
from app.ocr.llm_parser import LLMReceiptParser
from app.utils.visualizer import Visualizer


root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

if "SR_GPU_LAYERS" not in os.environ:
    os.environ["SR_GPU_LAYERS"] = "0"



@pytest.fixture(scope="module")
def categorizer():
    """Initializes the categorization model only (lightweight)."""
    print("\n⏳ [Fixture] Loading ProductCategorizer...")
    return ProductCategorizer()


@pytest.fixture(scope="module")
def inference_service():
    """
    Initializes the ENTIRE service (OCR + NLP + Visualizer).
    This is a heavy operation, so we do it once per module (scope="module").
    """
    print(
        "\n⏳ [Fixture] Loading InferenceService (OCR + NLP)... this may take a while."
    )
    try:
        parser = LLMReceiptParser()
        categorizer = ProductCategorizer()
        visualizer = Visualizer()

        service = InferenceService(
            parser=parser, categorizer=categorizer, visualizer=visualizer
        )
        return service
    except Exception as e:
        pytest.fail(f"Failed to initialize service: {e}")


@pytest.fixture(scope="session")
def event_loop():
    """
    Required for asynchronous tests in pytest,
    so that 'module' scoped fixtures work correctly with async.
    """
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
