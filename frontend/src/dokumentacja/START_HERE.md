# Smart Receipt - Integracja Frontend-Backend GOTOWA!

##  Statystyka Pracy

 **12 hooków** - Pełna pokrycie API
 **4 szablony komponentów** - Ready-to-copy przykłady
 **5 plików dokumentacji** - Kompletny przewodnik
 **0 plików .js duplikatów** - Kod oczyszczony

---

##  Co Otrzymujesz

###  Dokumentacja (5 plików)

#### INTEGRATION_GUIDE.md (Obowiązkowe!)
-  Jak działa API
-  Pełna dokumentacja 12 hooków
-  Szablony komponentów
-  Najczęstsze błędy i rozwiązania
-  Workflow po widoków

**Czytaj najpierw!** 

#### QUICK_START.md
- Szybkie wprowadzenie
- Konfiguracja zmiennych
- Pierwsze kroki
- Fazy implementacji
- Import szablonów

#### README_INTEGRATION.md
- Podsumowanie co zostało zrobione
- Zalecana kolejność implementacji
- Struktury folder
- FAQ

#### CHEAT_SHEET.md
- Szybki dostęp do hooków
- Kopij & paste kody
- Typy danych
- Import cheat sheet

#### QUICK_START.md
- Tutorial dla początkujących

---

### 2️ Hooki (12 sztuk)

#### Istniejące (5)
```
 useAuth              - Login, logout, refresh
 useDashboard         - Dane główne
 useExpenses          - Lista wydatków  
 useCategorySummary   - Kategorii
 useExpensesTrend     - Trend
```

#### Nowe (7) 
```
 useShoppingLists         - CRUD dla list
 useShoppingListDetail    - Szczegóły listy
 useBudgets              - Zarządzanie budżetami
 useCategories           - CRUD dla kategorii
 useExpenseDetail        - Szczegóły wydatku
 useReceiptUpload        - OCR paragony
 useExpenseCreate        - Dodawanie wydatku
```

**Wszystkie hooki mają:**
-  TypeScript types
-  Error handling
-  Loading state
-  Refetch function
-  Automatyczny token JWT

---

### 3 Szablony Komponentów (4)

#### DashboardPage.tsx
```typescript
// Co zawiera:
- Nawigacja miesięcy
- KPI Cards (wydatki, budżet, alerty)
- Wykres kołowy kategorii
- Wykres liniowy trendu
- Ostatnie wydatki
- Action buttons

// Użycie:
import { useDashboard, useExpenses, useExpensesTrend, useCategorySummary } from "@/hooks";
```

#### ExpensesPage.tsx
```typescript
// Co zawiera:
- Filtry (kategoria, miesiąc, rok)
- Sortowanie
- Paginacja
- Możliwość rozwinięcia
- Link do edycji

// Użycie:
import { useExpenses, useCategories } from "@/hooks";
```

#### ReceiptsPage.tsx
```typescript
// Co zawiera:
- Drag & drop area
- Edytor danych OCR
- Przycisk akceptacji
- Historia paragonów (TODO)

// Użycie:
import { useReceiptUpload, useExpenseCreate } from "@/hooks";
```

#### ShoppingListsPage.tsx
```typescript
// Co zawiera:
- Przegląd list
- Edycja pozycji
- Zaznaczanie kupionych
- Progress bar

// Użycie:
import { useShoppingLists, useShoppingListDetail } from "@/hooks";
```

---

##  Jak Zacząć (3 minuty)

### Krok 1: Przeczytaj
```bash
# VS Code
Otwórz: INTEGRATION_GUIDE.md
Otwórz: QUICK_START.md
Otwórz: CHEAT_SHEET.md
```

### Krok 2: Skonfiguruj
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1.0
```

### Krok 3: Kopiuj & Używaj
```typescript
// src/app/dashboard/page.tsx
import DashboardPage from "./DashboardPage";
export default DashboardPage;
```

### Krok 4: Testuuj
```bash
# Terminal
npm run dev
# Otwórz http://localhost:3000/dashboard
```

---

##  Zadania Które Masz Teraz

- [ ] Przeczytaj INTEGRATION_GUIDE.md (20 min)
- [ ] Skonfiguruj .env.local (2 min)
- [ ] Skopiuj DashboardPage.tsx do page.tsx (2 min)
- [ ] Testuuj na http://localhost:3000 (2 min)
- [ ] Skopiuj ExpensesPage.tsx (2 min)
- [ ] Skopiuj ReceiptsPage.tsx (2 min)
- [ ] Skopiuj ShoppingListsPage.tsx (2 min)
- [ ] Zainstaluj biblioteki do wykresów (npm install recharts) (2 min)
- [ ] Dostosuj UI do swoich potrzeb
- [ ] Wdrażaj następne funkcje

---

##  Struktura Plików

```
frontend/
├──  INTEGRATION_GUIDE.md       ← Czytaj najpierw!
├──  QUICK_START.md             ← Tutorial
├──  README_INTEGRATION.md      ← Podsumowanie
├──  CHEAT_SHEET.md             ← Szybki dostęp
├── .env.local                    ← Zmienne (stwórz!)
├── src/
│   ├── hooks/                    ← 12 hooków
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   ├── useExpenses.ts
│   │   ├── useCategorySummary.ts
│   │   ├── useExpensesTrend.ts
│   │   ├── useShoppingLists.ts        ✨ NOWY
│   │   ├── useShoppingListDetail.ts   ✨ NOWY
│   │   ├── useBudgets.ts              ✨ NOWY
│   │   ├── useCategories.ts           ✨ NOWY
│   │   ├── useExpenseDetail.ts        ✨ NOWY
│   │   ├── useReceiptUpload.ts        ✨ NOWY
│   │   └── useExpenseCreate.ts        ✨ NOWY
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx      ✨ SZABLON
│   │   │   └── page.tsx               ← Zmień nazwę
│   │   ├── expenses/
│   │   │   ├── ExpensesPage.tsx       ✨ SZABLON
│   │   │   └── page.tsx               ← Zmień nazwę
│   │   ├── receipts/
│   │   │   ├── ReceiptsPage.tsx       ✨ SZABLON
│   │   │   └── page.tsx               ← Zmień nazwę
│   │   └── shopping-lists/
│   │       ├── ShoppingListsPage.tsx  ✨ SZABLON
│   │       └── page.tsx               ← Zmień nazwę
│   ├── api-client/               ← Wygenerowany client
│   └── components/               ← Komponenty reusable
└── package.json
```

---

##  Najlepsze Praktyki

###  Rób tak
```typescript
// 1. Zawsze sprawdzaj stany
const { data, isLoading, error } = useMyHook();

if (isLoading) return <Spinner />;
if (error) return <Alert>{error}</Alert>;
if (!data) return <Empty />;

return <Content data={data} />;

// 2. Używaj type safety
import type { Expense } from "@/api-client/models";

// 3. Refetch po akcji
const { refetch } = useMyHook();
await refetch();

// 4. Obsługuj paginację
const { setPage } = useExpenses();
setPage(page + 1);
```

### ❌ Nie rób tak
```typescript
// 1. Fetch zamiast hooka
const res = await fetch(url);  // ❌ Nie masz tokenu!

// 2. Ignorowanie null
const result = data.value;     // ❌ Może być undefined!

// 3. Brak error handling
const res = await api.method(); // ❌ Nie wiadomo czy sukces

// 4. Infinita pętle
useEffect(() => {
  fetchData();
}, []);                         // ❌ Będzie bez zależności!

// Zamiast tego:
useEffect(() => {
  fetchData();
}, [year, month]);              // ✅ Specificne zależności
```

---

## 🔧 Instalacja Bibliotek

### Wykresy (Recharts - rekomendowany)
```bash
npm install recharts
```

Wykorzystanie:
```typescript
import { PieChart, Pie, LineChart, Line } from "recharts";
```

### Alternatywy
```bash
npm install chart.js react-chartjs-2  # Chart.js
npm install plotly.js-dist-min        # Plotly
```

---

## 🐛 Debugowanie

### Jeśli coś nie działa:

1. **Network tab w DevTools**
   - Czy żądanie idzie do backendu?
   - Czy response zawiera dane?

2. **Console w DevTools**
   - Czy są błędy?
   - Sprawdzaj console.error w hookach

3. **localStorage**
   ```javascript
   localStorage.getItem("accessToken")
   ```

4. **Sprawdź .env.local**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1.0
   ```

5. **Czy backend jest uruchomiony?**
   ```bash
   curl http://localhost:8080/api/v1.0
   ```

---

## 📞 Gdzie Szukać Pomócy

| Problem | Rozwiązanie |
|---------|------------|
| Co zwraca endpoint X? | `openapi.yaml` |
| Jak używać hooka Y? | `src/hooks/useY.ts` + `INTEGRATION_GUIDE.md` |
| Jakie są pola w modelu? | `src/api-client/models/` |
| Jak budować komponent? | `src/app/*/Page.tsx` - szablony |
| Błąd 401 | Token wygasł, zaloguj się ponownie |
| CORS error | Sprawdzić `NEXT_PUBLIC_API_URL` |
| Paginacja nie działa | Sprawdzić `setPage()` |
| Hook nie fetch'uje | Sprawdzić dependencies w `useEffect` |

---

## 🎓 Materiały Edukacyjne

### React
- [React Hooks - Oficjalna Dokumentacja](https://react.dev/reference/react)
- [useState Hook](https://react.dev/reference/react/useState)
- [useEffect Hook](https://react.dev/reference/react/useEffect)

### Next.js
- [Next.js 16 Dokumentacja](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Axios (obsługiwane przez client)
- [Axios Dokumentacja](https://axios-http.com/docs/intro)

---

## 🎯 Cele Na Każdy Tydzień

### Tydzień 1
- [ ] Przeczytaj dokumentację
- [ ] Skonfiguruj projekt
- [ ] Zbuduj Dashboard
- [ ] Zbuduj stronę logowania

**Rezultat:** Widok główny aplikacji działający

### Tydzień 2
- [ ] Zbuduj listę wydatków
- [ ] Dodaj filtry
- [ ] Dodawanie wydatku
- [ ] Edycja wydatku

**Rezultat:** Pełny CRUD dla wydatków

### Tydzień 3
- [ ] Wgrywanie paragonów
- [ ] Edycja OCR
- [ ] Łączenie z wydatkami
- [ ] Historia paragonów

**Rezultat:** Funkcjonalność OCR gotowa

### Tydzień 4
- [ ] Listy zakupów
- [ ] Kategorie
- [ ] Budżety
- [ ] Ustawienia

**Rezultat:** Aplikacja kompletna 🎉

---

## 🏁 Checkpoint

Jeśli dotarłeś tutaj, to znaczy że:
- ✅ Usunąłeś zduplikowane pliki .js
- ✅ Masz 12 gotowych hooków
- ✅ Masz 4 szablony komponentów
- ✅ Masz 5 plików dokumentacji
- ✅ Wiesz gdzie szukać informacji

## Następny Krok

👉 **Otwórz `INTEGRATION_GUIDE.md` i zacznij czytać!**

---

## 🙌 Podsumowanie

**Masz teraz wszystko co potrzeba aby:**
1. Zalogować się na backendzie
2. Pobierać dane z API
3. Wyświetlać dane w UI
4. Edytować dane
5. Obsługiwać błędy
6. Obsługiwać loadingi
7. Wgrywać paragony
8. Zarządzać listami zakupów
9. Zarządzać budżetami
10. Zarządzać kategoriami

**Powodzenia w development'cie!** 🚀

---

*Ostatnia aktualizacja: 29 listopad 2025*
*Smart Receipt Frontend Integration v1.0*
