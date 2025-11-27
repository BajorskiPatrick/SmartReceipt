# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.ocr_module_api_base import BaseOcrModuleApi
import openapi_server.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    Path,
    Query,
    Response,
    Security,
    status,
)

from app.models.extra_models import TokenModel  # noqa: F401
from app.models.error_response import ErrorResponse
from app.models.ocr_result import OcrResult


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/ai/ocr/process",
    responses={
        200: {"model": OcrResult, "description": "Receipt data extracted successfully"},
        400: {"model": ErrorResponse, "description": "Failed to process image"},
    },
    tags=["OcrModule"],
    summary="Process receipt image (OCR)",
    response_model_by_alias=True,
)
async def process_receipt_ocr(
    image: str = Form(None, description=""),
) -> OcrResult:
    """AI module endpoint that accepts an image and returns structured data in JSON format. Uses libraries such as Tesseract, easyocr, or PaddleOCR."""
    return BaseOcrModuleApi.subclasses[0]().process_receipt_ocr(image)
