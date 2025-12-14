from fastapi import FastAPI
from app.api.v1.endpoints import ocr
from app.services.inference_service import inference_service
from contextlib import asynccontextmanager
from app.utils.logger import get_logger
import warnings

logger = get_logger("Main")


warnings.filterwarnings("ignore", message="builtin type SwigPyPacked has no __module__ attribute")
warnings.filterwarnings("ignore", message="builtin type SwigPyObject has no __module__ attribute")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models
    logger.info("   ⏳ Ładowanie modeli AI przy starcie aplikacji...")
    inference_service.load_models()
    logger.info("   ✅ Modele AI załadowane.")

    yield


app = FastAPI(title="SmartReceipt AI Module", version="1.0.0", lifespan=lifespan)


app.include_router(ocr.router, prefix="/api/v1.0/ai/ocr", tags=["OCR"])


@app.get("/health")
def health():
    # Prosty check czy modele żyją
    status = {
        "status": "ok",
        "models": {
            "yolo": inference_service.detector is not None,
            "donut": inference_service.parser is not None,
            "categorizer": inference_service.categorizer is not None,
        },
    }
    return status
