from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.inference_service import InferenceService, get_inference_service
from app.schemas.ocr import OcrResult, OcrExpenseItem
from app.utils.logger import get_logger

logger = get_logger("OCR_Endpoint")

router = APIRouter()


@router.post("/process", response_model=OcrResult)
async def process_receipt(
    image: UploadFile = File(...),
    service: InferenceService = Depends(get_inference_service),
):

    try:
        items = await service.process_receipt(image)
        expense_items = [OcrExpenseItem.from_dict(item) for item in items]
        return OcrResult(expenses=expense_items)
    except Exception as e:
        logger.error(f"Error processing receipt: {e}")
        raise HTTPException(status_code=500, detail=str(e))
