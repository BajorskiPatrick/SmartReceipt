from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.engine import engine
from app.schemas.receipt import ReceiptResponse