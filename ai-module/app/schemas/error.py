from __future__ import annotations
import pprint
import json
from datetime import datetime
from pydantic import BaseModel, Field, StrictInt, StrictStr
from typing import Any, ClassVar, Dict, List

try:
    from typing import Self
except ImportError:
    from typing_extensions import Self


class ErrorResponse(BaseModel):
    """
    ErrorResponse
    """

    error_id: StrictStr = Field(alias="errorId")
    timestamp: datetime
    status: StrictInt
    error: StrictStr
    message: StrictStr
    path: StrictStr
    details: List[StrictStr]
    __properties: ClassVar[List[str]] = [
        "errorId",
        "timestamp",
        "status",
        "error",
        "message",
        "path",
        "details",
    ]

    model_config = {
        "populate_by_name": True,
        "validate_assignment": True,
        "protected_namespaces": (),
    }

    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> Self:
        """Create an instance of ErrorResponse from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self) -> Dict[str, Any]:
        """Return the dictionary representation of the model using alias."""
        _dict = self.model_dump(
            by_alias=True,
            exclude={},
            exclude_none=True,
        )
        return _dict

    @classmethod
    def from_dict(cls, obj: Dict) -> Self:
        """Create an instance of ErrorResponse from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate(
            {
                "errorId": obj.get("errorId"),
                "timestamp": obj.get("timestamp"),
                "status": obj.get("status"),
                "error": obj.get("error"),
                "message": obj.get("message"),
                "path": obj.get("path"),
                "details": obj.get("details"),
            }
        )
        return _obj
