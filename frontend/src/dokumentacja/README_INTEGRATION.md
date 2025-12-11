# 📦 Smart Receipt - Frontend Integration Complete

## ✅ Co zostało zrobione

Przygotowałem dla Ciebie **kompletny zestaw narzędzi** do połączenia frontendu z backendem:

### 📚 Dokumentacja
1. **INTEGRATION_GUIDE.md** - Pełny przewodnik integracji
   - Jak działa API
   - Dokumentacja wszystkich hooków
   - Szablony komponentów
   - Najczęstsze błędy i rozwiązania

2. **QUICK_START.md** - Szybkie wprowadzenie
   - Konfiguracja
   - Pierwsze kroki
   - Fazy implementacji

### 🔧 Nowe Hooki (8 sztuk)

| Hook | Opis | Status |
|------|------|--------|
| `useShoppingLists` | Pobierz listę list zakupów | ✅ Gotowy |
| `useShoppingListDetail` | Szczegóły listy + CRUD na pozycjach | ✅ Gotowy |
| `useBudgets` | Zarządzanie budżetami | ✅ Gotowy |
| `useCategories` | Lista kategorii + dodawanie/edycja/usuwanie | ✅ Gotowy |
| `useExpenseDetail` | Szczegóły wydatku + edycja/usunięcie | ✅ Gotowy |
| `useReceiptUpload` | Wgrywanie i przetwarzanie paragonów (OCR) | ✅ Gotowy |
| `useExpenseCreate` | Dodawanie nowych wydatków | ✅ Gotowy |

**Razem: 12 hooków** (5 istniejących + 7 nowych)

### 🎨 Przykładowe Komponenty

1. **DashboardPage.tsx** - Strona główna z:
   - Nawigacją miesięcy
   - KPI cards (wydatki, budżet, alerty)
   - Wykresem kołowym kategorii
   - Wykresem liniowym trendu
   - Ostatnimi wydatkami

2. **ExpensesPage.tsx** - Lista wydatków z:
   - Filtrami (kategoria, miesiąc, rok)
   - Paginacją
   - Możliwością rozwinięcia pozycji

3. **ReceiptsPage.tsx** - Bank paragonów z:
   - Drag & drop area
   - Edytorem danych OCR
   - Przyciskiem akceptacji

4. **ShoppingListsPage.tsx** - Listy zakupów z:
   - Przeglądem list
   - Edycją pozycji
   - Zaznaczaniem kupionych

---

## 🚀 Jak rozpocząć

### Krok 1: Przeczytaj dokumenty
```bash
# W Visual Studio Code
# Otwórz: INTEGRATION_GUIDE.md
# Otwórz: QUICK_START.md
```

### Krok 2: Skonfiguruj zmienne środowiskowe
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Krok 3: Używaj hooków w swoich komponentach
```typescript
import { useDashboard } from "@/hooks/useDashboard";

const { data, isLoading, error } = useDashboard(2025, 11);
```

### Krok 4: Kopiuj szablony
Pliki w:
- `src/app/dashboard/DashboardPage.tsx`
- `src/app/expenses/ExpensesPage.tsx`
- `src/app/receipts/ReceiptsPage.tsx`
- `src/app/shopping-lists/ShoppingListsPage.tsx`

Możesz je kopiować i dostosowywać do swoich potrzeb.

---

## 📁 Struktura Hooków

Każdy hook ma konsistent strukturę:

```typescript
export function useMyFeature() {
  const [data, setData] = useState<Type | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // Implementacja
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}
```

**Wszystkie hooki obsługują:**
- ✅ Loading state
- ✅ Error handling
- ✅ Refetch function
- ✅ Automatyczne pobieranie tokenu z localStorage

---

## 🎯 Zalecana kolejność implementacji

### Tydzień 1: Podstawy
- [ ] Login/Register (useAuth)
- [ ] Dashboard (useDashboard, useExpensesTrend, useCategorySummary)
- [ ] Ostatnie wydatki na stronie głównej (useExpenses)

### Tydzień 2: Wydatki
- [ ] Lista wydatków z filtrami (useExpenses)
- [ ] Dodawanie wydatku (useExpenseCreate)
- [ ] Szczegóły wydatku (useExpenseDetail)
- [ ] Edycja i usuwanie

### Tydzień 3: Paragony
- [ ] Wgrywanie paragonów (useReceiptUpload)
- [ ] Edycja danych OCR
- [ ] Łączenie z wydatkami

### Tydzień 4: Reszta
- [ ] Listy zakupów (useShoppingLists, useShoppingListDetail)
- [ ] Kategorie (useCategories)
- [ ] Budżety (useBudgets)
- [ ] Ustawienia

---

## 💡 Praktyczne Porady

### 1. Token JWT
```typescript
// Automatycznie wysyłany w każdym żądaniu
// Pobierany z localStorage.accessToken
// Brak potrzeby ręcznego dodawania do headers
```

### 2. Obsługa błędów
```typescript
const { data, error, isLoading } = useMyHook();

if (error) {
  // Błąd od API
}
```

### 3. Refresh danych
```typescript
const { data, refetch } = useMyHook();

// Coś się zmieniło, odśwież:
await refetch();
```

### 4. Paginacja
```typescript
const { data, page, totalPages, setPage } = useExpenses(year, month);

// Idź na następną stronę
setPage(page + 1);
```

---

## 🔍 Gdzie szukać odpowiedzi

| Problem | Rozwiązanie |
|---------|------------|
| Co zwraca endpoint? | `backend/src/main/resources/api/openapi.yaml` |
| Jak użyć hooka X? | `frontend/src/hooks/useX.ts` + `INTEGRATION_GUIDE.md` |
| Jakie są dostępne pola? | `frontend/src/api-client/models/` |
| Jak budować komponent? | `frontend/src/app/*/` - szablony |
| Błąd 401? | Zaloguj się ponownie, token wygasł |
| CORS error? | Sprawdź `NEXT_PUBLIC_API_URL` |

---

## 📊 Podsumowanie plików

```
frontend/
├── INTEGRATION_GUIDE.md          ← 📘 Pełna dokumentacja
├── QUICK_START.md               ← 🚀 Szybkie intro
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts           (Istniejący)
│   │   ├── useDashboard.ts      (Istniejący)
│   │   ├── useExpanses.ts       (Istniejący)
│   │   ├── useCategorySummary.ts (Istniejący)
│   │   ├── useExpensesTrend.ts  (Istniejący)
│   │   ├── useShoppingLists.ts     ✨ NOWY
│   │   ├── useShoppingListDetail.ts ✨ NOWY
│   │   ├── useBudgets.ts          ✨ NOWY
│   │   ├── useCategories.ts       ✨ NOWY
│   │   ├── useExpenseDetail.ts     ✨ NOWY
│   │   ├── useReceiptUpload.ts     ✨ NOWY
│   │   └── useExpenseCreate.ts     ✨ NOWY
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx    ✨ SZABLON
│   │   ├── expenses/
│   │   │   └── ExpensesPage.tsx     ✨ SZABLON
│   │   ├── receipts/
│   │   │   └── ReceiptsPage.tsx     ✨ SZABLON
│   │   └── shopping-lists/
│   │       └── ShoppingListsPage.tsx ✨ SZABLON
│   └── api-client/              (Wygenerowany)
```

---

## ✨ Bonusy

### 1. Wszystkie hooki mają TypeScript types
Pełna auto-kompletacja w IDE!

### 2. Error handling wbudowany
Nie musisz się martwić o obsługę błędów - hooki już to robią

### 3. Loading states
Każdy hook ma `isLoading` flag

### 4. Automatyczne pobieranie tokenu
Token JWT jest automatycznie dodawany do każdego żądania

### 5. Przykłady komponentów
Masz szablony do kopiowania i dostosowywania

---

## ❓ FAQ

**P: Czy muszę zmieniać nazwy hooków?**
O: Nie! Używaj ich jak są. Wyjątek: `useExpanses` - to typo ale trzymamy dla kompatybilności.

**P: Czy mogę używać hooki w całej aplikacji?**
O: Tak! Dodaj `"use client"` na górze komponenty.

**P: Jak obsługiwać błędy?**
O: Każdy hook zwraca `error`. Wyświetl Alert jeśli `error !== null`.

**P: Jak refetch'ować dane?**
O: Każdy hook ma `refetch` funkcję.

**P: Czy trzeba Redux'a?**
O: Nie! React Context + hooki wystarczają.

**P: Mogę edytować szablony komponentów?**
O: Oczywiście! To tylko szablon, dostosuj do swoich potrzeb.

---

## 🎉 Gotowe!

Masz wszystko co potrzeba do zaangażowania frontendu z backendem! 

**Następne kroki:**
1. Przeczytaj `INTEGRATION_GUIDE.md`
2. Przejrzyj `QUICK_START.md`
3. Zacznij od Dashboard'u
4. Kopiuj szablony i dostosowuj
5. Rozwijaj aplikację 🚀

---

## 📞 Jeśli coś nie działa

1. **Sprawdzaj DevTools → Network tab** - czy żądania idą?
2. **DevTools → Console** - czy są błędy?
3. **Czy token jest w localStorage?** - `localStorage.getItem("accessToken")`
4. **Czy backend jest uruchomiony?** - `http://localhost:8080/api/v1.0`
5. **Czy zmienne środowiskowe są ustawione?** - `.env.local`

---

Powodzenia w rozwoju! 🚀
