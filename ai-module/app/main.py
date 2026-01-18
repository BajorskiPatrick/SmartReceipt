from fastapi import FastAPI, Request, Depends
from app.api.v1.endpoints import ocr
from app.services.inference_service import get_inference_service, InferenceService
from contextlib import asynccontextmanager
from app.utils.logger import get_logger, configure_logging
import warnings
from time import time

logger = get_logger("Main")


warnings.filterwarnings(
    "ignore", message="builtin type SwigPyPacked has no __module__ attribute"
)
warnings.filterwarnings(
    "ignore", message="builtin type SwigPyObject has no __module__ attribute"
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Load ML models
    configure_logging()
    logger.info("Initializing AI models...")
    try:
        get_inference_service()
        logger.info("AI models loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load AI models: {e}")

    yield


app = FastAPI(title="SmartReceipt AI Module", version="1.0.0", lifespan=lifespan)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time()
    response = await call_next(request)

    process_time = time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    if "ocr" in request.url.path:
        logger.info(f"Request to OCR endpoint processed in {process_time:.4f} seconds")
    return response


app.include_router(ocr.router, prefix="/api/v1.0/ai/ocr", tags=["OCR"])


@app.get("/health")
def health(service: InferenceService = Depends(get_inference_service)):
    status = {
        "status": "ok",
        "models": {
            "parser": service.parser is not None,
            "categorizer": service.categorizer is not None,
        },
    }
    return status
