# 📋 Frontend API Cheat Sheet

Szybki dostęp do hooków i ich użycia.

## Autentykacja

### Login
```typescript
import { useAuth } from "@/hooks/useAuth";

const { login, loading, error } = useAuth();
await login({ email: "test@example.com", password: "password" });
```

### Token w localStorage
```typescript
localStorage.getItem("accessToken")  // Pobierz token
localStorage.setItem("accessToken", token)  // Ustaw token
```

---

## Dashboard & Dane

### Pobierz dane strony głównej
```typescript
import { useDashboard } from "@/hooks/useDashboard";

const { data, isLoading, error } = useDashboard(2025, 11);
// data.kpi.totalSpendingMonth
// data.categorySummary[]
// data.trendSummary[]
```

### Trend wydatków
```typescript
import { useExpensesTrend } from "@/hooks/useExpensesTrend";

const { data, isLoading } = useExpensesTrend(2025, 11);
// data: { year, month, totalAmount }[]
```

### Wydatki po kategoriach
```typescript
import { useCategorySummary } from "@/hooks/useCategorySummary";

const categories = useCategorySummary(2025, 11);
// categories: { categoryId, categoryName, totalSpendingMonth, budget }[]
```

---

## Wydatki

### Lista wydatków
```typescript
import { useExpenses } from "@/hooks/useExpanses";

const { data, page, totalPages, setPage, isLoading } = useExpenses(
  2025,           // rok
  11,             // miesiąc
  categoryId,     // optional filter
  0,              // strona
  20              // rozmiar
);
```

### Szczegóły wydatku
```typescript
import { useExpenseDetail } from "@/hooks/useExpenseDetail";

const { expense, isLoading, updateExpense, deleteExpense } = 
  useExpenseDetail(expenseId);

// Edytuj
await updateExpense({ ...expense });

// Usuń
await deleteExpense();
```

### Dodaj wydatek ręczny
```typescript
import { useExpenseCreate } from "@/hooks/useExpenseCreate";

const { createExpense, isLoading, error } = useExpenseCreate();

await createExpense({
  transactionDate: "2025-11-15T10:00:00Z",
  description: "Sklep",
  items: [
    {
      productName: "Mleko",
      price: 3.50,
      quantity: 1,
      categoryId: "..."
    }
  ]
});
```

---

## Paragony & OCR

### Wgraj paragon
```typescript
import { useReceiptUpload } from "@/hooks/useReceiptUpload";

const { upload, isLoading, error, result } = useReceiptUpload();

const file = /* HTMLInputElement.files[0] */;
await upload(file);

// result: { transactionDate, description, totalAmount, items[] }
```

---

## Kategorie

### Pobierz kategorie
```typescript
import { useCategories } from "@/hooks/useCategories";

const { categories, isLoading, error } = useCategories();
```

### Dodaj kategorię
```typescript
const { createCategory } = useCategories();
await createCategory({ name: "Food", description: "..." });
```

### Edytuj kategorię
```typescript
const { updateCategory } = useCategories();
await updateCategory(categoryId, { name: "NewName" });
```

### Usuń kategorię
```typescript
const { deleteCategory } = useCategories();
await deleteCategory(categoryId);
```

---

## Budżety

### Pobierz budżet
```typescript
import { useBudgets } from "@/hooks/useBudgets";

const { budget, isLoading } = useBudgets(2025, 11);
// budget.budget (całkowity)
// budget.categoryBudgets[] (po kategoriach)
```

### Edytuj budżet
```typescript
const { updateBudget } = useBudgets(2025, 11);

await updateBudget({
  budget: 5000,
  categoryBudgets: [
    { categoryId: "...", budget: 1500 }
  ]
});
```

---

## Listy Zakupów

### Pobierz wszystkie listy
```typescript
import { useShoppingLists } from "@/hooks/useShoppingLists";

const { lists, isLoading, error, createList, deleteList } = 
  useShoppingLists();
```

### Utwórz listę
```typescript
const { createList } = useShoppingLists();

await createList({
  name: "Weekend shopping",
  items: []
});
```

### Usuń listę
```typescript
const { deleteList } = useShoppingLists();
await deleteList(listId);
```

### Szczegóły listy
```typescript
import { useShoppingListDetail } from "@/hooks/useShoppingListDetail";

const { list, addItem, updateItem, removeItem } = 
  useShoppingListDetail(listId);
```

### Dodaj produkt do listy
```typescript
const { addItem } = useShoppingListDetail(listId);

await addItem("Bread", 2, "pcs.");
```

### Zaznacz jako kupione
```typescript
const { updateItem } = useShoppingListDetail(listId);

await updateItem(itemId, true);  // true = kupione
```

### Usuń produkt
```typescript
const { removeItem } = useShoppingListDetail(listId);

await removeItem(itemId);
```

---

## Error Handling

### Zawsze sprawdzaj
```typescript
const { data, error, isLoading } = useMyHook();

if (isLoading) return <Spinner />;
if (error) return <Alert>{error}</Alert>;
if (!data) return <Empty />;

return <Content data={data} />;
```

### Refresh po błędzie
```typescript
const { refetch, error } = useMyHook();

const retry = () => {
  refetch();
};
```

---

## Typy danych

### Expense
```typescript
{
  expenseId: string;
  description: string;
  transactionDate: string;  // ISO 8601
  totalAmount: number;
  itemCount: number;
  items?: ExpenseItem[];
}

// ExpenseItem
{
  expenseItemId: string;
  productName: string;
  quantity: number;
  price: number;
  categoryId: string;
  categoryName?: string;
}
```

### OcrExpense
```typescript
{
  transactionDate: string;
  description: string;
  totalAmount: number;
  items: OcrExpenseItem[];
}

// OcrExpenseItem (edytowalne pola)
{
  productName: string;
  quantity: number;
  price: number;
  categoryId?: string;
}
```

### ShoppingList
```typescript
{
  shoppingListId: string;
  name: string;
  createdAt: string;
  itemCount: number;
  items: ShoppingListItem[];
}

// ShoppingListItem
{
  shoppingListItemId: string;
  productName: string;
  quantity: number;
  unit?: string;
  isPurchased: boolean;
}
```

### Category
```typescript
{
  categoryId: string;
  name: string;
  description?: string;
}
```

### DashboardData
```typescript
{
  kpi: {
    totalSpendingMonth: number;
    budget: number;
  };
  categorySummary: DashboardCategorySummaryItem[];
  trendSummary: DashboardTrendItem[];
}

// DashboardCategorySummaryItem
{
  categoryId: string;
  categoryName: string;
  totalSpendingMonth: number;
  budget?: number;
}

// DashboardTrendItem
{
  year: number;
  month: number;
  totalAmount: number;
}
```

---

## Zmienne Środowiskowe

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Wdrażanie

1. **Wszystkie hooki mają `isLoading`** - pokaż loader
2. **Wszystkie hooki mają `error`** - pokaż alert
3. **Wszystkie hooki mają `refetch`** - pozwól użytkownikowi odświeżyć
4. **Token jest automatycznie wysyłany** - nie musisz go dodawać

---

## Szybkie Porady

### Nigdy tak nie rób ❌
```typescript
// Fetch bez autoryzacji
const res = await fetch(url);

// Ignorowanie loadingów
const { data } = useMyHook();
setData(data);  // Może być null!

// Brak error handling
const result = await apiCall();
```

### Zawsze tak rób ✅
```typescript
// Użyj hooka
const { data, isLoading, error } = useMyHook();

// Sprawdź wszystkie stany
if (isLoading) return <Spinner />;
if (error) return <Alert>{error}</Alert>;
if (!data) return <Empty />;

// Render dane
return <Content data={data} />;
```

---

## Import Cheat Sheet

```typescript
// Auth
import { useAuth } from "@/hooks/useAuth";

// Dashboard & Data
import { useDashboard } from "@/hooks/useDashboard";
import { useExpensesTrend } from "@/hooks/useExpensesTrend";
import { useCategorySummary } from "@/hooks/useCategorySummary";

// Expenses
import { useExpenses } from "@/hooks/useExpanses";  // Note: typo
import { useExpenseDetail } from "@/hooks/useExpenseDetail";
import { useExpenseCreate } from "@/hooks/useExpenseCreate";

// Receipts
import { useReceiptUpload } from "@/hooks/useReceiptUpload";

// Categories
import { useCategories } from "@/hooks/useCategories";

// Budgets
import { useBudgets } from "@/hooks/useBudgets";

// Shopping Lists
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { useShoppingListDetail } from "@/hooks/useShoppingListDetail";

// Types
import type {
  Expense,
  ExpenseItem,
  OcrExpense,
  Category,
  ShoppingList,
  DashboardData,
} from "@/api-client/models";

// API Client
import { api } from "@/api-client/client";
```

---

## Co Zwracają Hooki

```typescript
// Getter Hooki
useDashboard()         // { data, isLoading, error }
useCategorySummary()   // Tablica
useExpensesTrend()     // { data, isLoading }
useExpenses()          // { data, page, totalPages, setPage, isLoading }

// CRUD Hooki
useCategories()        // { categories, isLoading, error, create, update, delete, refetch }
useBudgets()           // { budget, isLoading, error, updateBudget, refetch }
useShoppingLists()     // { lists, isLoading, error, createList, deleteList, refetch }

// Detail Hooki
useExpenseDetail()     // { expense, isLoading, error, updateExpense, deleteExpense, refetch }
useShoppingListDetail()// { list, isLoading, error, addItem, updateItem, removeItem, refetch }

// Action Hooki
useReceiptUpload()     // { upload, isLoading, error, result }
useExpenseCreate()     // { createExpense, isLoading, error }
useAuth()              // { login, refresh, logout, loading, error }
```

---

Powodzenia! 🚀
