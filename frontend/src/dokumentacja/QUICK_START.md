# 🚀 Quick Start - Jak zacząć

Ten dokument zawiera praktyczne przykłady jak zacząć budować aplikację.

## 1. Skonfiguruj zmienne środowiskowe

W pliku `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Zainstaluj hooki

Wszystkie hooki znajdują się w `frontend/src/hooks/`:
- `useAuth.ts` - autentykacja
- `useDashboard.ts` - dane strony głównej
- `useExpenses.ts` - lista wydatków
- `useExpensesTrend.ts` - trend
- `useCategorySummary.ts` - kategorie
- `useShoppingLists.ts` - listy zakupów ✨ (nowy)
- `useShoppingListDetail.ts` - szczegóły listy ✨ (nowy)
- `useBudgets.ts` - budżety ✨ (nowy)
- `useCategories.ts` - kategorie ✨ (nowy)
- `useExpenseDetail.ts` - szczegóły wydatku ✨ (nowy)
- `useReceiptUpload.ts` - wgrywanie paragonów ✨ (nowy)
- `useExpenseCreate.ts` - tworzenie wydatku ✨ (nowy)

## 3. Pierwsze kroki

### Krok 1: Zbuduj stronę logowania
```typescript
// src/app/login/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Logowanie</h1>
      
      {error && <div className="alert">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Hasło"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? "Logowanie..." : "Zaloguj się"}
      </button>
    </form>
  );
}
```

### Krok 2: Zbuduj Dashboard
Patrz: `src/app/dashboard/DashboardPage.tsx` (już stworzony)

Jak go używać:
```bash
# 1. Skopiuj zawartość do src/app/dashboard/page.tsx lub page.tsx w folderze route'ów
# 2. Zainstaluj bibliotekę do rysowania wykresów
npm install recharts

# 3. Wyświetli się na http://localhost:3000/dashboard
```

### Krok 3: Zbuduj listę wydatków
Patrz: `src/app/expenses/ExpensesPage.tsx` (już stworzony)

### Krok 4: Zbuduj wgrywanie paragonów
Patrz: `src/app/receipts/ReceiptsPage.tsx` (już stworzony)

### Krok 5: Listy zakupów
Patrz: `src/app/shopping-lists/ShoppingListsPage.tsx` (już stworzony)

## 4. Struktura folderów

```
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx          ← Logowanie
│   │   ├── dashboard/
│   │   │   └── page.tsx          ← Strona główna
│   │   ├── expenses/
│   │   │   ├── page.tsx          ← Lista wydatków
│   │   │   ├── new/
│   │   │   │   └── page.tsx      ← Dodaj wydatek
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Szczegóły wydatku
│   │   ├── receipts/
│   │   │   └── page.tsx          ← Bank paragonów
│   │   ├── shopping-lists/
│   │   │   ├── page.tsx          ← Listy zakupów
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Szczegóły listy
│   │   ├── settings/
│   │   │   └── page.tsx          ← Ustawienia
│   │   └── layout.tsx
│   ├── hooks/                     ← Hooki do API
│   ├── api-client/               ← Wygenerowany client
│   └── components/               ← Komponenty reusable
├── .env.local                    ← Zmienne środowiskowe
└── package.json
```

## 5. Najpierw co robić

Zalecana kolejność implementacji:

### Faza 1 (2-3 dni)
- [ ] Login & Register (useAuth)
- [ ] Dashboard (useDashboard)
- [ ] Ostatnie wydatki (useExpenses)

### Faza 2 (2-3 dni)
- [ ] Lista wydatków z filtami (useExpenses)
- [ ] Dodawanie wydatku ręcznego (useExpenseCreate)
- [ ] Szczegóły wydatku (useExpenseDetail)

### Faza 3 (2-3 dni)
- [ ] Wgrywanie paragonów (useReceiptUpload)
- [ ] Edycja danych z OCR
- [ ] Łączenie paragonu z wydatkiem

### Faza 4 (1-2 dni)
- [ ] Listy zakupów (useShoppingLists)
- [ ] Zarządzanie pozycjami

### Faza 5 (1-2 dni)
- [ ] Ustawienia (useCategories, useBudgets)
- [ ] Kategorie
- [ ] Budżety

## 6. Szablony komponentów

### Hook + Component szablon
```typescript
// src/app/my-page/page.tsx
"use client";

import { useMyHook } from "@/hooks/useMyHook";

export default function MyPage() {
  const { data, isLoading, error, actionMethod } = useMyHook();

  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd: {error}</div>;
  if (!data) return <div>Brak danych</div>;

  const handleAction = async () => {
    const success = await actionMethod();
    if (success) {
      // Powiadom użytkownika
    }
  };

  return (
    <div>
      {/* Render komponenty */}
      <button onClick={handleAction}>Akcja</button>
    </div>
  );
}
```

## 7. Common Patterns

### Pattern 1: Pobieranie danych z parametrami
```typescript
const { data: expenses } = useExpenses(
  2025,              // rok
  11,                // miesiąc
  categoryId,        // opcjonalnie kategoria
  0,                 // strona
  20                 // rozmiar
);
```

### Pattern 2: Obsługa loadingów
```typescript
{isLoading ? (
  <Spinner />
) : error ? (
  <Alert error={error} />
) : !data ? (
  <EmptyState />
) : (
  <DataView data={data} />
)}
```

### Pattern 3: Formularz z hookiem
```typescript
const { createItem, isLoading, error } = useCreate();

const handleSubmit = async (formData: CreateData) => {
  const result = await createItem(formData);
  if (result) {
    // Success
  }
};
```

## 8. Testowanie

### Zaloguj się w aplikacji
1. URL: `http://localhost:3000/login`
2. Email: (stworzony na backendzie)
3. Hasło: (stworzony na backendzie)

### Testuj hooki w konsoli
```javascript
// W DevTools > Console
// Sprawdź czy token jest w localStorage
localStorage.getItem("accessToken");

// Odśwież stronę
location.reload();

// Sprawdź Network tab przy refresh'u - powinny iść żądania do backendu
```

### Debugowanie API errors
```typescript
// W hookach już jest console.error, sprawdzaj DevTools
// Network tab: zobacz request/response
// Console: zobaczysz błędy
```

## 9. Instalacja bibliotek do wykresów (opcjonalnie)

```bash
# Recharts (rekomendowany)
npm install recharts

# Lub alternatywnie
npm install chart.js react-chartjs-2
```

## 10. Typowe problemy i rozwiązania

| Problem | Rozwiązanie |
|---------|------------|
| Token nie jest wysyłany | Użyj `api.method()` zamiast `fetch()` |
| 401 Unauthorized | Token wygasł, zaloguj się ponownie |
| CORS error | Sprawdź `NEXT_PUBLIC_API_URL` w .env.local |
| Dane nie są pobierane | Sprawdź Network tab czy żądanie idzie |
| Komponenty się nie aktualizują | Dodaj zależności do useEffect |
| Plik jest za duży przy OCR | Max 10MB dla paragonów |

## 📞 Szybkie linki

- **OpenAPI spec**: `backend/src/main/resources/api/openapi.yaml`
- **Hooki**: `frontend/src/hooks/`
- **API Client**: `frontend/src/api-client/`
- **Integracja Guide**: `INTEGRATION_GUIDE.md` (ten plik)
- **Przykłady**: patrz pliki w `frontend/src/app/*/`

---

## Next Steps

1. ✅ Przeczytaj `INTEGRATION_GUIDE.md`
2. ✅ Sprawdź przykłady w `frontend/src/app/dashboard/DashboardPage.tsx`
3. ✅ Zmień nazwę pliku na `page.tsx` w odpowiednim folderze route'ów
4. ✅ Testuję na `http://localhost:3000`
5. ✅ Rozbudowuję o nowe funkcje

Powodzenia! 🎉
