from pydantic import BaseModel, Field
from typing import Optional, List, ClassVar, Dict, Any
import json
import pprint

try:
    from typing import Self
except ImportError:
    from typing_extensions import Self


class OcrExpenseItem(BaseModel):
    productName: Optional[str] = Field(None)
    price: Optional[float] = None
    quantity: Optional[float] = 1.0
    categoryName: Optional[str] = None

    model_config = {"populate_by_name": True}

    def to_dict(self):
        return self.model_dump(by_alias=True, exclude_none=True)

    @classmethod
    def from_dict(cls, obj):
        return cls.model_validate(obj)


class OcrResult(BaseModel):
    """
    OcrResult
    """

    expenses: Optional[List[OcrExpenseItem]] = None
    __properties: ClassVar[List[str]] = ["expenses"]

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
        """Create an instance of OcrResult from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self) -> Dict[str, Any]:
        """Return the dictionary representation of the model using alias."""
        _dict = self.model_dump(
            by_alias=True,
            exclude={},
            exclude_none=True,
        )
        # override the default output from pydantic by calling `to_dict()` of each item in expenses (list)
        _items = []
        if self.expenses:
            for _item in self.expenses:
                if _item:
                    _items.append(_item.to_dict())
            _dict["expenses"] = _items
        return _dict

    @classmethod
    def from_dict(cls, obj: Dict) -> Self:
        """Create an instance of OcrResult from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate(
            {
                "expenses": (
                    [OcrExpenseItem.from_dict(_item) for _item in obj.get("expenses")]
                    if obj.get("expenses") is not None
                    else None
                )
            }
        )
        return _obj
