Oto Twoja dokumentacja wstępna przepisana na format Markdown, z zachowaniem struktury i pełnym cytowaniem.

# Dokumentacja Wstępna Projektu: Inteligentny Asystent Zarządzania Wydatkami (Smart Receipt)

* **Zespół Projektowy:** [Imiona i Nazwiska Członków Zespołu – 5 osób]
* **Termin Realizacji:** 3 miesiące
* **Prowadzący Zajęcia:** [Imię i Nazwisko Prowadzącego]

---

## Wstęp

Niniejszy dokument przedstawia koncepcję i zakres projektu "Inteligentny Asystent Zarządzania Wydatkami", realizowanego w ramach przedmiotu Studio Projektowe. Celem projektu jest stworzenie innowacyjnego narzędzia, które zrewolucjonizuje sposób, w jaki użytkownicy monitorują i zarządzają swoimi codziennymi finansami. Aplikacja ma za zadanie automatyzować proces kategoryzacji wydatków, oferować intuicyjny przegląd finansów oraz wspierać w planowaniu przyszłych zakupów. Wierzymy, że projekt ten znacząco ułatwi użytkownikom świadome zarządzanie budżetem domowym.

---

## Cel Projektu

Głównym celem projektu jest stworzenie kompleksowego systemu do zarządzania wydatkami osobistymi, charakteryzującego się wysokim stopniem automatyzacji i intuicyjności. Chcemy dostarczyć narzędzie, które umożliwi użytkownikom:
* Automatyczną identyfikację i kategoryzację wydatków na podstawie paragonów.
* Wizualizację struktury wydatków poprzez interaktywny dashboard.
* Łatwe wprowadzanie i modyfikowanie danych finansowych.
* Wsparcie w tworzeniu list zakupowych (opcjonalnie, jako rozszerzenie).

---

## Opis Funkcjonalności

Projekt będzie składał się z dwóch głównych modułów oraz zestawu funkcjonalności dodatkowych:

### Moduł Identyfikacji i Ekstrakcji Wydatków z Paragonów (OCR)

**Funkcjonalność:** Użytkownik będzie mógł przesłać zdjęcie paragonu (np. wykonane telefonem). System za pomocą technik OCR (Optical Character Recognition) przetworzy obraz, identyfikując kluczowe informacje, takie jak nazwa produktu, ilość, cena jednostkowa i cena całkowita.
**Technologia:** Python z bibliotekami do OCR (np. Tesseract, easyocr, PaddleOCR).
**Wynik:** Ekstrakcja danych z paragonu i zwrócenie ich w ustrukturyzowanym formacie JSON, gotowym do dalszego przetwarzania.

### Moduł Kategoryzacji Wydatków i Aktualizacji Dashboardu

**Funkcjonalność:** Ekstrahowane z paragonu (lub wprowadzone ręcznie) pozycje wydatków zostaną automatycznie przypisane do predefiniowanych kategorii zakupowych (np. "Spożywcze", "Transport", "Rozrywka", "Rachunki"). Do tego celu zostaną wykorzystane modele oparte na transformerach.
**Technologia:** Python (transformers, scikit-learn), FastAPI do udostępnienia endpointów.
**Dashboard:** Po kategoryzacji, wszystkie wydatki danego użytkownika zostaną zagregowane i zaprezentowane na interaktywnym dashboardzie. Dashboard umożliwi podgląd wydatków w różnych perspektywach (miesięczny/tygodniowy widok, wykresy kołowe przedstawiające udział poszczególnych kategorii, historia transakcji).

### Funkcjonalności dodatkowe

* **Ręczne Wprowadzanie Wydatków:** Użytkownik będzie miał możliwość manualnego dodawania pojedynczych wydatków, przypisując je do odpowiednich kategorii.
* **Tworzenie List Zakupowych:** Moduł umożliwiający tworzenie, edytowanie i zarządzanie listami zakupowymi. Użytkownik będzie mógł dodawać produkty do listy, oznaczać je jako zakupione, itd.
* **Inteligentny Asystent List Zakupowych (Opcjonalne Rozszerzenie):** Na podstawie historii poprzednich zakupów (kategoryzacji wydatków), system będzie w stanie sugerować produkty do dodania do nowej listy zakupowej. Może to obejmować przypomnienia o regularnie kupowanych artykułach lub propozycje związane z sezonowością.

---

## Architektura systemu i wykorzystane technologie

Projekt zostanie zaimplementowany z wykorzystaniem nowoczesnych i sprawdzonych technologii, zapewniających skalowalność, wydajność i łatwość rozwoju.

### Architektura Ogólna

System będzie oparty na architekturze mikroserwisowej (lub modularnej), co pozwoli na niezależny rozwój i skalowanie poszczególnych komponentów. Komunikacja między modułami będzie odbywać się za pośrednictwem REST API.

### Technologie Backendowe

* **Core Aplikacji (API Gateway, Zarządzanie Użytkownikami, Zarządzanie Wydatkami, Logika Biznesowa):**
    * **Spring Boot (Java):** Wybrany ze względu na swoją dojrzałość, bogaty ekosystem, wysoką wydajność, bezpieczeństwo oraz szerokie wsparcie dla tworzenia RESTful Web Services. Będzie stanowił szkielet aplikacji, zarządzając autoryzacją, uwierzytelnianiem, danymi użytkowników i ich wydatkami.
* **Moduły AI/ML (OCR, Kategoryzacja):**
    * **FastAPI (Python):** Wykorzystane do wystawienia endpointów dla modułów OCR i analizy koszykowej. FastAPI jest idealne dla zadań wymagających wysokiej wydajności (asynchroniczność) i szybkiego prototypowania, doskonale integrując się z ekosystemem Pythona, co jest kluczowe dla bibliotek ML/AI.

### Technologie Frontendowe

* **React:** Wybrany do budowy interfejsu użytkownika ze względu na swoją popularność, elastyczność, komponentową architekturę oraz bogaty ekosystem narzędzi. Zapewni dynamiczny i responsywny interfejs, który łatwo połączy się z backendem.

### Baza Danych

Kwestia do przegadania i podjęcia ostatecznej decyzji.
* **MongoDB (NoSQL):** Rozważany ze względu na elastyczność schematu danych, co może być korzystne dla przechowywania różnorodnych danych z paragonów oraz profili użytkowników. Wysoka skalowalność wertykalna i horyzontalna.
* **PostgreSQL (Relacyjna):** Alternatywa, oferująca silne gwarancje spójności danych (ACID), dojrzałość i szerokie wsparcie dla zapytań SQL. Może być preferowany, jeśli struktura danych wydatków będzie bardziej ustrukturyzowana i wymagać będzie złożonych relacji.

Zalecamy dogłębną analizę wymagań projektowych w kontekście przyszłych rozszerzeń, aby podjąć optymalną decyzję dotyczącą wyboru bazy danych.

---

## Oczekiwane Wyniki i Możliwe Rozszerzenia

Na zakończenie projektu oczekujemy w pełni funkcjonalnej aplikacji, która spełnia wszystkie założone cele. System powinien być stabilny, wydajny i łatwy w obsłudze.

Możliwe przyszłe rozszerzenia (poza zakresem projektu dyplomowego):
* Integracja z bankowością online.
* Wsparcie dla wielu walut.
* Funkcje budżetowania i alertów o przekroczeniu budżetu.
* Generowanie raportów finansowych.
* Wersje mobilne aplikacji (iOS/Android).
* Rozwinięcie asystenta list zakupowych o rekomendacje bazujące na promocjach.

---

## Podsumowanie

Projekt "Inteligentny Asystent Zarządzania Wydatkami" to ambitne przedsięwzięcie, które ma potencjał do stworzenia realnie wartościowego narzędzia dla użytkowników. Połączenie zaawansowanych technologii (OCR, Transformers) z intuicyjnym interfejsem użytkownika pozwoli nam stworzyć aplikację, która wyróżni się na tle istniejących rozwiązań. Jesteśmy przekonani, że z pełnym zaangażowaniem i wykorzystaniem naszych umiejętności, osiągniemy sukces w realizacji tego projektu.
