from pydantic import BaseModel

class ExpenseItemBase(BaseModel):
    productName: str
    quantity: int
    price: float
    categoryId: str

class OcrExpenseItem(ExpenseItemBase):
    pass

class OcrResult(BaseModel):
    expenses: list[OcrExpenseItem]