from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.inference_service import inference_service
from app.schemas.ocr import OcrResult, OcrExpenseItem
from app.utils.logger import get_logger

logger = get_logger("OCR_Endpoint")

router = APIRouter()


@router.post("/process", response_model=OcrResult)
async def process_receipt(image: UploadFile = File(...)):

    try:
        result = await inference_service.process_receipt(image)
        expense_items = [OcrExpenseItem.from_dict(item) for item in result]
        return OcrResult(expenses=expense_items)
    except Exception as e:
        # Log the error properly in production
        logger.error(f"Error processing receipt: {e}")
        raise HTTPException(status_code=500, detail=str(e))
