# Inteligentny Asystent Zarządzania Wydatkami (Smart Receipt)

Witamy w repozytorium projektu "Inteligentny Asystent Zarządzania Wydatkami".

## 🚀 Uruchamianie projektu

Projekt jest w pełni skonteneryzowany. Aby uruchomić wszystkie usługi (backend, frontend, moduł AI, baza danych), upewnij się, że masz zainstalowany Docker i Docker Compose.

1.  Sklonuj repozytorium:
    ```bash
    git clone https://github.com/JanBanasik/Studio-projektowe.git
    cd inteligentny-asystent-wydatkow
    ```
2.  Uruchom wszystkie usługi:
    ```bash
    docker-compose up --build
    ```

Po uruchomieniu:
* Frontend będzie dostępny pod adresem: `http://localhost:3000`
* Backend API będzie dostępne pod adresem: `http://localhost:8080`
* Moduł AI będzie dostępny pod adresem: `http://localhost:8000`

## 📚 Dokumentacja

Wszelka dokumentacja, w tym specyfikacja API (openapi.yaml) oraz diagramy architektury, znajduje się w katalogu `/docs`.
