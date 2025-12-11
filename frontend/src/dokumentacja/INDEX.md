# 📑 Dokumentacja - Spis Treści

Wszyscy nowe pliki znajdują się w `frontend/` i są gotowe do użycia.

## 🚀 ZACZNIJ TUTAJ

### START_HERE.md (5 minut)
Szybkie podsumowanie co zostało zrobione i jak zacząć.
- ✅ Czym jest ta integracja
- ✅ 12 hooków - krótko opisane
- ✅ 4 szablony - co zawierają
- ✅ Jak zacząć w 3 minuty
- ✅ Zadania na każdy dzień

**Zarabiany czas:** 5 minut

---

## 📘 PEŁNA DOKUMENTACJA

### INTEGRATION_GUIDE.md (30 minut)
Kompletny przewodnik integracji frontend-backend.
- ✅ Jak działa API
- ✅ Pełna dokumentacja 12 hooków z przykładami
- ✅ Szablony komponentów
- ✅ Workflow dla każdego widoku
- ✅ Najczęstsze błędy i rozwiązania

**Czytaj, gdy:** Potrzebujesz pełnego zrozumienia systemu
**Zarabiany czas:** 30 minut

---

## 🎓 TUTORIALE

### QUICK_START.md (15 minut)
Praktyczne tutorial dla początkujących.
- ✅ Konfiguracja zmiennych
- ✅ Pierwsze kroki z hookami
- ✅ Struktura folderów
- ✅ Common patterns
- ✅ Testowanie

**Czytaj, gdy:** Chcesz szybko coś zbudować
**Zarabiany czas:** 15 minut

---

## ⚡ SZYBKI DOSTĘP

### CHEAT_SHEET.md (2 minuty do znalezienia czegoś)
Szybkie reference dla wszystkich hooków.
- ✅ Kopij & paste kody
- ✅ Import cheat sheet
- ✅ Typy danych
- ✅ Error handling snippets

**Czytaj, gdy:** Szukasz szybko kodu do wklejenia
**Zarabiany czas:** 2 minuty

---

## 📊 PODSUMOWANIE

### README_INTEGRATION.md (10 minut)
Podsumowanie całej pracy.
- ✅ Co zostało zrobione
- ✅ Zalecana kolejność implementacji
- ✅ FAQ
- ✅ Plany na 4 tygodnie

**Czytaj, gdy:** Chcesz zobaczyć big picture
**Zarabiany czas:** 10 minut

---

## 🛠️ SZABLONY KOMPONENTÓW

### DashboardPage.tsx
Strona główna aplikacji.

**Co zawiera:**
- Nawigacja miesięcy
- KPI cards
- Wykresy (kołowy, liniowy)
- Lista ostatnich wydatków
- Action buttons

**Jak używać:**
1. Skopiuj zawartość
2. Zmień nazwę na `page.tsx` w folderze `dashboard/`
3. Zainstaluj `recharts` (wykresy)
4. Testuuj

**Zarabiany czas do wdrażania:** 10 minut

---

### ExpensesPage.tsx
Lista wydatków z filtami.

**Co zawiera:**
- Filtry (kategoria, miesiąc, rok)
- Paginacja
- Możliwość rozwinięcia pozycji
- Linki do edycji

**Jak używać:**
1. Skopiuj zawartość
2. Zmień nazwę na `page.tsx` w folderze `expenses/`
3. Dopracuj UI
4. Testuuj

**Zarabiany czas do wdrażania:** 10 minut

---

### ReceiptsPage.tsx
Bank paragonów - wgrywanie i edycja OCR.

**Co zawiera:**
- Drag & drop area
- Edytor danych OCR
- Przycisk akceptacji
- Placeholder na historię

**Jak używać:**
1. Skopiuj zawartość
2. Zmień nazwę na `page.tsx` w folderze `receipts/`
3. Dodaj historię paragonów
4. Testuuj

**Zarabiany czas do wdrażania:** 15 minut

---

### ShoppingListsPage.tsx
Zarządzanie listami zakupów.

**Co zawiera:**
- Przegląd list (sidebar)
- Szczegóły listy
- Edycja pozycji
- Zaznaczanie kupionych
- Progress bar

**Jak używać:**
1. Skopiuj zawartość
2. Zmień nazwę na `page.tsx` w folderze `shopping-lists/`
3. Dopracuj UI
4. Testuuj

**Zarabiany czas do wdrażania:** 15 minut

---

## 🔗 HOOKI

### useAuth.ts
Autentykacja - login, logout, refresh.

```typescript
const { login, logout, refresh, loading, error } = useAuth();
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useAuth
**Przykład:** START_HERE.md

---

### useDashboard.ts
Pobierz dane do strony głównej.

```typescript
const { data, isLoading, error } = useDashboard(2025, 11);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useDashboard
**Przykład:** DashboardPage.tsx

---

### useExpenses.ts
Lista wydatków z paginacją.

```typescript
const { data, page, totalPages, setPage } = useExpenses(2025, 11);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useExpenses
**Przykład:** ExpensesPage.tsx

---

### useCategorySummary.ts
Wydatki po kategoriach.

```typescript
const categories = useCategorySummary(2025, 11);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useCategorySummary

---

### useExpensesTrend.ts
Trend wydatków w miesiącu.

```typescript
const { data, isLoading } = useExpensesTrend(2025, 11);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useExpensesTrend

---

### useShoppingLists.ts ✨
Pobierz wszystkie listy zakupów.

```typescript
const { lists, createList, deleteList } = useShoppingLists();
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useShoppingLists
**Przykład:** ShoppingListsPage.tsx

---

### useShoppingListDetail.ts ✨
Szczegóły listy - CRUD na pozycjach.

```typescript
const { list, addItem, updateItem, removeItem } = useShoppingListDetail(listId);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useShoppingListDetail
**Przykład:** ShoppingListsPage.tsx

---

### useBudgets.ts ✨
Zarządzanie budżetami.

```typescript
const { budget, updateBudget } = useBudgets(2025, 11);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useBudgets

---

### useCategories.ts ✨
CRUD dla kategorii.

```typescript
const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useCategories

---

### useExpenseDetail.ts ✨
Szczegóły wydatku - edycja i usunięcie.

```typescript
const { expense, updateExpense, deleteExpense } = useExpenseDetail(expenseId);
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useExpenseDetail

---

### useReceiptUpload.ts ✨
Wgrywanie paragonów i przetwarzanie OCR.

```typescript
const { upload, result, isLoading, error } = useReceiptUpload();
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useReceiptUpload
**Przykład:** ReceiptsPage.tsx

---

### useExpenseCreate.ts ✨
Dodawanie nowych wydatków.

```typescript
const { createExpense, isLoading, error } = useExpenseCreate();
```

**Dokumentacja:** INTEGRATION_GUIDE.md → useExpenseCreate

---

## 📍 Mapa Dokumentacji

```
START_HERE.md
│
├─→ Chcesz pełną dokumentację?
│   └─→ INTEGRATION_GUIDE.md
│
├─→ Chcesz tutorial?
│   └─→ QUICK_START.md
│
├─→ Chcesz szybko coś znaleźć?
│   └─→ CHEAT_SHEET.md
│
├─→ Chcesz zobaczyć big picture?
│   └─→ README_INTEGRATION.md
│
└─→ Chcesz kod do wklejenia?
    └─→ Szablony komponentów (DashboardPage.tsx, itd)
```

---

## ⏰ Szacunkowy czas czytania

| Dokument | Czas | Priorytet |
|----------|------|-----------|
| START_HERE.md | 5 min | 🔴 OBOWIĄZKOWE |
| INTEGRATION_GUIDE.md | 30 min | 🟠 Ważne |
| QUICK_START.md | 15 min | 🟡 Przydatne |
| CHEAT_SHEET.md | 2 min | 🟢 Reference |
| README_INTEGRATION.md | 10 min | 🟢 Informacyjne |

**Razem:** ~60 minut do pełnego zrozumienia

---

## 🎯 Ścieżka Nauki

### Dzień 1 (1 godzina)
- [ ] Przeczytaj START_HERE.md (5 min)
- [ ] Przeczytaj INTEGRATION_GUIDE.md (30 min)
- [ ] Przeczytaj QUICK_START.md (15 min)
- [ ] Skonfiguruj .env.local (10 min)

### Dzień 2 (1 godzina)
- [ ] Skopiuj DashboardPage.tsx (10 min)
- [ ] Zainstaluj biblioteki (5 min)
- [ ] Testuuj na localhost (15 min)
- [ ] Dostosuj UI (30 min)

### Dzień 3+ (Rozwijanie aplikacji)
- [ ] Skopiuj dalsze szablony
- [ ] Korzystaj z CHEAT_SHEET.md do szybkiego dostępu
- [ ] Rozwijaj nowe funkcje

---

## 🔍 Szybki Dostęp Po Problemie

**Problem:** Nie wiem jak użyć hooka X
→ Szukaj w `INTEGRATION_GUIDE.md` lub `CHEAT_SHEET.md`

**Problem:** Nie wiem jak zbudować komponent
→ Patrz `QUICK_START.md` → Szablony komponentów

**Problem:** Błąd w API
→ Szukaj w `INTEGRATION_GUIDE.md` → Najczęstsze błędy

**Problem:** Szukam szybko kodu do wklejenia
→ `CHEAT_SHEET.md` → Copy & paste

**Problem:** Chcę zobaczyć pełny workflow
→ `DashboardPage.tsx`, `ExpensesPage.tsx`, etc.

---

## 📞 Support

Jeśli czegoś nie rozumiesz:
1. Szukaj w dokumentacji (Ctrl+F)
2. Patrz na szablony komponentów
3. Sprawdzaj CHEAT_SHEET.md
4. Czytaj komentarze w kodzie hooków

---

## ✅ Checklist Przed Startem

- [ ] Mam Node.js zainstalowany
- [ ] Mam backend uruchomiony na `http://localhost:8080`
- [ ] Przeczytałem `START_HERE.md`
- [ ] Skonfigurałem `.env.local`
- [ ] Instaluję biblioteki (`npm install`)
- [ ] Testuję na `http://localhost:3000`

---

**Gotowy? Zacznij od `START_HERE.md`!** 🚀
