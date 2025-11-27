# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from app.models.error_response import ErrorResponse
from app.models.ocr_result import OcrResult


class BaseOcrModuleApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseOcrModuleApi.subclasses = BaseOcrModuleApi.subclasses + (cls,)
    def process_receipt_ocr(
        self,
        image: str,
    ) -> OcrResult:
        """AI module endpoint that accepts an image and returns structured data in JSON format. Uses libraries such as Tesseract, easyocr, or PaddleOCR."""
        ...
