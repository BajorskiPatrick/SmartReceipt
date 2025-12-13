import { ExpenseFormData } from "@/app/components/dialogs/ExpenseDialog";

export function mapOcrToExpenseForm(ocr: any): ExpenseFormData {
  return {
    id: null,
    description: ocr.storeName || "Receipt",
    transactionDate: new Date(ocr.date || new Date()).toISOString().slice(0, 16),
    items: ocr.items.map((i: any) => ({
      expenseItemId: undefined,
      productName: i.productName,
      price: i.price,
      quantity: i.quantity ?? 1,
      categoryId: i.categoryId || ""
    }))
  };
}
