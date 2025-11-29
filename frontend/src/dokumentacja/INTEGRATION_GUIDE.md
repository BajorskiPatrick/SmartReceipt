# Frontend-Backend Integration Guide

## Spis treści
1. [Jak działa API](#jak-działa-api)
2. [Istniejące hooki](#istniejące-hooki)
3. [Nowe hooki](#nowe-hooki)
4. [Szablony komponentów](#szablony-komponentów)
5. [Workflow po widoków](#workflow-po-widoków)

---

## Jak działa API

### 1. Konfiguracja API Client
```typescript
// src/api-client/client.ts
import { Configuration, MainAppApi } from "@/api-client";

const basePath = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0";

const config = new Configuration({
  basePath,
  accessToken: () => localStorage.getItem("accessToken") || "",
});

export const api = new MainAppApi(config);
```

**Ważne:**
- Token JWT jest pobierany z `localStorage.accessToken`
- Endpoint backendu ustawiany przez zmienną środowiskową `.env.local`
- API jest generowany z `openapi.yaml` (Spring Boot Gradle plugin)

### 2. Jak dodać token do żądań
Token JWT jest **automatycznie** dodawany do każdego żądania przez `setupAxios.ts`:
- Po logowaniu: `localStorage.setItem("accessToken", token)`
- Przy każdym żądaniu: header `Authorization: Bearer <token>`
- Refreshing: hookos `useAuth` ma metodę `refresh()`

---

## Istniejące hooki

### `useAuth` - Autentykacja
```typescript
import { useAuth } from "@/hooks/useAuth";

function LoginPage() {
  const { login, refresh, logout, loading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const success = await login({ email, password });
    if (success) {
      // Token jest w localStorage, można przejść na dashboard
    }
  };

  return (
    <form onSubmit={() => handleLogin("user@email.com", "password")}>
      {error && <Alert>{error}</Alert>}
      {loading ? "Logowanie..." : "Zaloguj się"}
    </form>
  );
}
```

**Dostępne metody:**
- `login(data: UserLogin)` - zwraca `boolean`
- `refresh()` - odświeża token
- `logout()` - wylogowuje użytkownika
- `loading` - stan ładowania
- `error` - komunikat błędu

---

### `useDashboard` - Dane strony głównej
```typescript
import { useDashboard } from "@/hooks/useDashboard";

function Dashboard() {
  const { data, isLoading, error } = useDashboard(2025, 11); // rok, miesiąc
  
  if (isLoading) return <Spinner />;
  if (error) return <Alert>Błąd: {error}</Alert>;

  return (
    <div>
      {/* Całkowite wydatki w miesiącu */}
      <KPI value={data?.kpi.totalSpendingMonth} />
      
      {/* Wydatki po kategoriach */}
      {data?.categorySummary.map(cat => (
        <CategoryCard key={cat.categoryId} {...cat} />
      ))}
      
      {/* Trend (zmiana każdego dnia w miesiącu) */}
      {data?.trendSummary.map(trend => (
        <TrendPoint key={`${trend.year}-${trend.month}`} {...trend} />
      ))}
    </div>
  );
}
```

**Zwracane dane:**
```typescript
interface DashboardData {
  kpi: {
    totalSpendingMonth: number;
    budget: number;
  };
  categorySummary: DashboardCategorySummaryItem[];
  trendSummary: DashboardTrendItem[];
}
```

---

### `useExpenses` - Lista wydatków
```typescript
import { useExpenses } from "@/hooks/useExpanses"; // Uwaga: typo w nazwie folderu

function ExpensesList() {
  const { data, page, totalPages, setPage, isLoading } = useExpenses(
    2025,  // rok
    11,    // miesiąc
    categoryId // optional
  );

  if (isLoading) return <Spinner />;

  return (
    <div>
      {data.map(expense => (
        <ExpenseRow key={expense.expenseId} {...expense} />
      ))}
      
      <Pagination 
        current={page} 
        total={totalPages}
        onChange={setPage}
      />
    </div>
  );
}
```

**Parametry:**
- `year` - rok (obowiązkowy)
- `month` - miesiąc 1-12 (obowiązkowy)
- `categoryId` - opcjonalnie filtruj po kategorii
- Paginacja: domyślnie 20 elementów na stronę

---

### `useExpensesTrend` - Trend wydatków
```typescript
import { useExpensesTrend } from "@/hooks/useExpensesTrend";

function TrendChart() {
  const { data, isLoading } = useExpensesTrend(2025, 11);

  return (
    <LineChart data={data}>
      {/* data zawiera wartości każdego dnia */}
    </LineChart>
  );
}
```

**Zwraca:** array `{ year, month, totalAmount }`

---

### `useCategorySummary` - Wydatki po kategoriach
```typescript
import { useCategorySummary } from "@/hooks/useCategorySummary";

function CategoriesChart() {
  const categories = useCategorySummary(2025, 11);

  return (
    <PieChart data={categories}>
      {/* categories: { categoryId, categoryName, totalSpendingMonth, budget } */}
    </PieChart>
  );
}
```

---

## Nowe hooki

Poniższe hooki zostały stworzone dla Ciebie:

### `useShoppingLists` - Listy zakupów
```typescript
import { useShoppingLists } from "@/hooks/useShoppingLists";

function ShoppingListsPage() {
  const { lists, isLoading, error, createList, deleteList } = useShoppingLists();

  return (
    <div>
      {lists.map(list => (
        <ShoppingListCard key={list.shoppingListId} {...list} />
      ))}
      <Button onClick={() => createList({ name: "Nowa lista" })}>
        + Nowa lista
      </Button>
    </div>
  );
}
```

---

### `useShoppingListDetail` - Szczegóły listy
```typescript
import { useShoppingListDetail } from "@/hooks/useShoppingListDetail";

function ShoppingListDetail({ listId }: { listId: string }) {
  const { list, isLoading, addItem, updateItem, removeItem } = 
    useShoppingListDetail(listId);

  const handleAddItem = async (productName: string) => {
    await addItem(productName);
  };

  return (
    <div>
      {list?.items.map(item => (
        <ShoppingListItemRow 
          key={item.shoppingListItemId}
          item={item}
          onToggle={() => updateItem(item.shoppingListItemId, !item.isPurchased)}
          onRemove={() => removeItem(item.shoppingListItemId)}
        />
      ))}
    </div>
  );
}
```

---

### `useBudgets` - Budżety
```typescript
import { useBudgets } from "@/hooks/useBudgets";

function BudgetSettings({ year, month }: { year: number; month: number }) {
  const { budget, isLoading, updateBudget } = useBudgets(year, month);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateBudget({ budget: 5000, categoryBudgets: [...] });
    }}>
      <Input value={budget?.budget} />
      <Submit>Zapisz budżet</Submit>
    </form>
  );
}
```

---

### `useCategories` - Kategorie
```typescript
import { useCategories } from "@/hooks/useCategories";

function CategoriesSettings() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = 
    useCategories();

  return (
    <div>
      {categories.map(cat => (
        <CategoryRow key={cat.categoryId} {...cat} />
      ))}
      <Button onClick={() => createCategory({ name: "Nowa kategoria" })}>
        + Dodaj
      </Button>
    </div>
  );
}
```

---

### `useExpenseDetail` - Szczegóły wydatku
```typescript
import { useExpenseDetail } from "@/hooks/useExpenseDetail";

function ExpenseDetailPage({ expenseId }: { expenseId: string }) {
  const { expense, isLoading, updateExpense, deleteExpense } = 
    useExpenseDetail(expenseId);

  return (
    <div>
      <h1>{expense?.description}</h1>
      <p>Kwota: {expense?.totalAmount} zł</p>
      <Button onClick={() => updateExpense({ ...expense })}>Edytuj</Button>
      <Button onClick={() => deleteExpense()}>Usuń</Button>
    </div>
  );
}
```

---

### `useReceiptUpload` - Wgrywanie paragonów
```typescript
import { useReceiptUpload } from "@/hooks/useReceiptUpload";

function ReceiptUploadForm() {
  const { upload, isLoading, error, result } = useReceiptUpload();

  const handleUpload = async (file: File) => {
    await upload(file);
    // result zawiera dane z OCR
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const file = (e.target as any).file.files[0];
      handleUpload(file);
    }}>
      {error && <Alert>{error}</Alert>}
      {result && <ReceiptPreview {...result} />}
      <input type="file" name="file" accept="image/*" />
      <Submit disabled={isLoading}>
        {isLoading ? "Przetwarzanie..." : "Wgraj paragon"}
      </Submit>
    </form>
  );
}
```

---

### `useExpenseCreate` - Tworzenie wydatku
```typescript
import { useExpenseCreate } from "@/hooks/useExpenseCreate";

function CreateExpenseForm() {
  const { createExpense, isLoading, error } = useExpenseCreate();

  const handleSubmit = async (formData: NewExpense) => {
    const success = await createExpense(formData);
    if (success) {
      // Wyświetl komunikat sukcesu
    }
  };

  return (
    <ExpenseForm onSubmit={handleSubmit} loading={isLoading} error={error} />
  );
}
```

---

## Szablony komponentów

### Szablon podstawowego Hook'a z error handling'iem
```typescript
// src/hooks/useMyFeature.ts
"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { MyDataType } from "@/api-client/models";

interface UseMyFeatureReturn {
  data: MyDataType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyFeature(id?: string): UseMyFeatureReturn {
  const [data, setData] = useState<MyDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.someMethod(id); // zmień na rzeczywistą metodę
      const payload = response?.data ?? response;
      setData(payload as MyDataType);
    } catch (err: any) {
      const message = err?.message || "Coś poszło nie tak";
      setError(message);
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
}
```

---

### Szablon komponentu z hookiem
```typescript
// src/app/components/MyFeatureComponent.tsx
"use client";

import { useMyFeature } from "@/hooks/useMyFeature";
import { Spinner } from "./Spinner";
import { Alert } from "./Alert";

interface MyFeatureComponentProps {
  id: string;
}

export function MyFeatureComponent({ id }: MyFeatureComponentProps) {
  const { data, isLoading, error, refetch } = useMyFeature(id);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
        <button onClick={refetch}>Spróbuj ponownie</button>
      </Alert>
    );
  }

  if (!data) {
    return <Alert type="info">Brak danych</Alert>;
  }

  return (
    <div className="container">
      {/* Render data */}
      {JSON.stringify(data)}
    </div>
  );
}
```

---

## Workflow po widoków

### 1. Dashboard (Strona główna)

**Co robić:**
1. Pobierz dane z `useDashboard(year, month)`
2. Wyświetl KPI (całkowite wydatki, budżet)
3. Pokaż wykres kołowy kategorii z `useCategorySummary`
4. Pokaż trend z `useExpensesTrend`
5. Wyświetl ostatnie wydatki z `useExpenses`

**Struktura:**
```
Dashboard
├── Header (nawigacja miesięcy)
├── KPI Cards (całkowite wydatki, budżet, alerty)
├── Charts Section
│   ├── Pie Chart (kategorySummary)
│   ├── Line Chart (trend)
│   └── Table (ostatnie 5 wydatków)
└── Action Buttons (Dodaj wydatek, Wgraj paragon)
```

**Przykładowy kod:**  Patrz `EXAMPLES_DASHBOARD.md`

---

### 2. Wydatki (Expenses)

**Co robić:**
1. Wyświetl listę z `useExpenses` z paginacją
2. Dodaj filtry (kategoria, data)
3. Umożliwić edycję/usunięcie z `useExpenseDetail`
4. Obsłuż dodanie wydatku z `useExpenseCreate`

**Struktura:**
```
Expenses
├── Filters (kategoria, data, kwota)
├── List
│   ├── Expense Row (rozwijalne)
│   └── Pagination
└── Forms (dodaj, edytuj)
```

---

### 3. Bank Paragonów (Receipts)

**Co robić:**
1. Wyświetl listę paragonów
2. Umożliwić wgranie nowego z `useReceiptUpload`
3. Edytuj dane z OCR
4. Pokaż powiązane wydatki

**Struktura:**
```
Receipts
├── Upload Area (drag & drop)
├── Receipts List
│   ├── Receipt Card (miniatura)
│   └── Details View (edytowalne pola OCR)
└── Link to Expense
```

---

### 4. Listy zakupów (Shopping Lists)

**Co robić:**
1. Pobierz listy z `useShoppingLists`
2. Umożliwić tworzenie nowej listy
3. Edytuj poszczególne elementy z `useShoppingListDetail`
4. Zaznaczanie kupionych pozycji

**Struktura:**
```
ShoppingLists
├── Lists Overview
│   ├── List Card (kliknij aby otworzyć)
│   └── + Nowa lista
└── List Detail
    ├── Items List (checkboxy)
    └── Add Item Form
```

---

### 5. Kategorie (Settings)

**Co robić:**
1. Pobierz kategorie z `useCategories`
2. Umożliwić dodanie/edycję/usunięcie
3. Obsłuż dodanie budżetu z `useBudgets`

**Struktura:**
```
Settings
├── Account (email, hasło)
├── Categories
│   ├── Categories List
│   └── Add/Edit Form
├── Budgets
│   ├── Monthly Budget
│   └── Category Budgets
└── Preferences (tryb ciemny, waluta, język)
```

---

##  Najczęstsze błędy

### 1. Token nie jest wysyłany
```typescript
//  ŹLE
const res = await fetch(`${API_URL}/expenses`);

//  DOBRZE
import { api } from "@/api-client/client";
const res = await api.getExpensesList(2025, 11);
```

### 2. Dane nie są parsowane
```typescript
//  ŹLE
const data = response;

//  DOBRZE
const data = response?.data ?? response;
```

### 3. Komponenty nie aktualizują się
```typescript
//  ŹLE - infinita pętla
useEffect(() => {
  fetchData();
}, []); // Dodaj zawsze zależności!

// DOBRZE
useEffect(() => {
  fetchData();
}, [year, month]); // Określ kiedy ma się ponownie uruchomić
```

### 4. Błędy CORS
```
 Access to XMLHttpRequest at 'http://localhost:8080/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Rozwiązanie:**
- Upewnij się, że backend ma CORS włączony dla `http://localhost:3000`
- W `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1.0`

---

##  Quick Start

1. **Zaloguj się:**
```typescript
const { login } = useAuth();
await login({ email: "test@example.com", password: "password" });
```

2. **Pobierz dane z dashboardu:**
```typescript
const { data } = useDashboard(2025, 11);
console.log(data.kpi.totalSpendingMonth);
```

3. **Wyświetl wydatki:**
```typescript
const { data: expenses } = useExpenses(2025, 11);
expenses.forEach(exp => console.log(exp.description, exp.totalAmount));
```

4. **Dodaj wydatek:**
```typescript
const { createExpense } = useExpenseCreate();
await createExpense({
  transactionDate: new Date().toISOString(),
  items: [{ productName: "Mleko", price: 3.50, quantity: 1, categoryId: "..." }]
});
```

---

##  Gdzie szukać odpowiedzi

| Problem | Gdzie szukać |
|---------|------------|
| Co zwraca endpoint X? | `backend/src/main/resources/api/openapi.yaml` |
| Jak używać hooka Y? | `frontend/src/hooks/useY.ts` |
| Jakie są dostępne fieldy? | `api-client/models/` |
| Jak połączyć hook z UI? | Szablony komponentów wyżej |
| Błąd z API? | Console → Network tab → sprawdź request/response |

---

Powodzenia! 
