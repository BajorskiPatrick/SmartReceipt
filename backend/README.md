# 🧾 SmartReceipt - Intelligent Expense Management System

SmartReceipt to nowoczesna aplikacja do zarządzania finansami osobistymi, która łączy tradycyjne śledzenie wydatków z automatyzacją opartą na AI (OCR paragonów).

Projekt realizowany jest w filozofii **API-First Design**.

---

## 🏗 Architektura i Filozofia (API-First)

Sercem projektu jest plik kontraktu: `backend/src/main/resources/api/openapi.yaml`.
Stanowi on **Jedyne Źródło Prawdy (Single Source of Truth)**.

* **Nie piszemy ręcznie** modeli DTO na backendzie.
* **Nie piszemy ręcznie** interfejsów TypeScript na frontendzie.
* Kod jest generowany automatycznie podczas budowania projektu.

### Stack Technologiczny
* **Backend:** Java 21, Spring Boot 3.5+, MongoDB.
* **Frontend:** React, TypeScript (Axios).
* **Build Tool:** Gradle (z pluginem OpenAPI Generator).
* **Security:** OAuth2 / JWT.

---

## 🚀 Główne Funkcjonalności (Opis Biznesowy)

### 1. Inteligentne Dodawanie Wydatków (OCR)
Użytkownik nie musi ręcznie przepisywać paragonów.
* **Proces:** Użytkownik robi zdjęcie -> Backend przetwarza obraz -> AI zwraca strukturę (Data, Sklep, Lista pozycji).
* **Endpoint:** `POST /expenses/upload`
* **UX:** Proces jest synchroniczny. Użytkownik czeka na przetworzenie i otrzymuje gotowy formularz do zatwierdzenia.

### 2. Dashboard Analityczny (High Performance)
Widok startowy aplikacji zaprojektowany, by minimalizować ruch sieciowy. Zamiast wielu zapytań, frontend pobiera jeden zagregowany obiekt.
* **KPI:** Aktualne wydatki vs Budżet miesięczny.
* **Trendy:** Wykres słupkowy wydatków z ostatnich 6 miesięcy.
* **Struktura:** Wykres kołowy podziału na kategorie.
* **Endpoint:** `GET /dashboard` (Zwraca obiekt `DashboardData`).

### 3. Lista Wydatków (Optimized List View)
Zoptymalizowana pod kątem wydajności na urządzeniach mobilnych.
* **Widok listy:** Pobiera "lekkie" obiekty `ExpenseSummary` (bez listy produktów, tylko kwota i data). Pozwala to na szybkie renderowanie długich list.
* **Szczegóły:** Dopiero po kliknięciu w wydatek pobierany jest pełny obiekt `Expense` z listą pozycji (`items`).
* **Filtrowanie:** Możliwość filtrowania po roku, miesiącu i kategorii.

### 4. Planowanie (Listy Zakupowe)
Moduł pozwalający tworzyć listy zakupów przed wizytą w sklepie, co dopełnia cykl "Planowanie -> Zakup -> Analiza".

---

## 👨‍💻 Przewodnik dla Backend Developera

### Jak pracować z kodem?
W tym projekcie **nie tworzysz ręcznie** klas w pakiecie `model`. Są one generowane z pliku YAML.

1.  **Modyfikacja API:** Jeśli musisz zmienić coś w modelu danych, edytuj `backend/src/main/resources/api/openapi.yaml`.
2.  **Generowanie:** Uruchom:
    ```bash
    ./gradlew generateServer
    ```
    Alternatywnie: `./gradlew build` (zadanie generowania jest podpięte pod kompilację).
3.  **Implementacja:**
    * Modele (DTO) znajdziesz w: `build/generated/server/.../model`.
    * Kontrolery piszesz w `src/main/java/.../controller`.
    * Adnotacje `@GetMapping` / `@PostMapping` nakładasz ręcznie na metody kontrolera, używając wygenerowanych modeli jako typów wejściowych/wyjściowych.

### Struktura Generowania (Model-Only)
W `build.gradle` włączony jest tryb generowania samych modeli (`apis: "false"`). Oznacza to, że masz pełną kontrolę nad warstwą HTTP (Controller), a automat dba o spójność struktur danych (JSON).

---

## 👨‍🎨 Przewodnik dla Frontend Developera

### Jak korzystać z API?
Nie musisz ręcznie typować odpowiedzi z backendu. Interfejsy TypeScript są generowane automatycznie.

1.  **Aktualizacja modeli:** Gdy backend zmieni API, uruchom w katalogu `backend`:
    ```bash
    ./gradlew generateClient
    ```
    *(Zadanie to jest również uruchamiane automatycznie przy budowaniu backendu).*

2.  **Lokalizacja plików:**
    Wygenerowane typy znajdziesz w: `frontend/src/api-client/models`.

3.  **Przykład użycia (React):**
    ```typescript
    import { DashboardData } from '@/api-client/models';
    import axios from 'axios';

    const fetchDashboard = async () => {
        // Masz pewność, że response.data jest typu DashboardData
        const response = await axios.get<DashboardData>('/api/dashboard');
        return response.data;
    }
    ```

---

## 💡 Kluczowe Decyzje Projektowe & Optymalizacje

### 1. Pattern: Summary vs Detail View
Aby uniknąć przesyłania tysięcy obiektów JSON przy ładowaniu historii wydatków, API rozróżnia dwa modele:
* `ExpenseSummary`: Lekki obiekt na listę.
* `Expense`: Pełny obiekt ze szczegółami paragonu.
  **Dlaczego?** Paragon może mieć 50 pozycji. Pobranie 100 paragonów x 50 pozycji = 5000 obiektów. To "zabiłoby" aplikację mobilną.

### 2. Agregacja Dashboardu
Endpoint `/dashboard` wykonuje agregację danych po stronie serwera (Backend-for-Frontend pattern).
**Dlaczego?** Oszczędza to frontendowi wykonywania 3-4 osobnych zapytań (KPI, Wykres 1, Wykres 2) i redukuje czas ładowania aplikacji (First Contentful Paint).

### 3. Generowanie "Model-Only"
Zarówno na backendzie, jak i frontendzie generujemy tylko **modele danych**, a nie pełne klienty/kontrolery.
**Dlaczego?** Daje to programistom większą elastyczność w doborze bibliotek (np. React Query na froncie, customowe security na backendzie) przy zachowaniu ścisłego typowania danych.

---

## 🛠 Uruchamianie Projektu

### Wymagania
* JDK 21
* Docker (dla bazy MongoDB - opcjonalnie)

### Backend
```bash
cd backend
./gradlew bootRun