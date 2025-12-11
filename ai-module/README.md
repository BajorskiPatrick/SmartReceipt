# 🧾 SmartReceipt AI Module

Mikroserwis oparty na AI do analizy i kategoryzacji paragonów.
Wykorzystuje:
- **OCR:** PaddleOCR (do odczytu tekstu)
- **LLM:** Llama 3.2 3B Instruct (do wyciągania produktów i cen do JSON)
- **NLP:** SetFit (do kategoryzacji produktów, np. "Groceries", "Alcohol")

---

## 🚀 Jak uruchomić? (Wymagany Docker)

Projekt jest w pełni skonteneryzowany. Nie musisz instalować Pythona ani modeli ręcznie.

### 1. Budowanie Obrazu
To potrwa kilka minut, ponieważ Docker musi pobrać model Llama (~2.5 GB) z HuggingFace.

```bash
docker build -t ai-module .
```

### 2. Uruchamianie
Wybierz opcję w zależności od swojego sprzętu:

✅ Opcja A: Masz kartę NVIDIA (Zalecane)

```bash
docker run --gpus all -p 8080:8080 ai-module
```
Czas przetwarzania paragonu: ~2-3 sekundy.

🐢 Opcja B: Nie masz karty NVIDIA (Tryb CPU)

```bash
docker run -p 8080:8080 ai-module
```
Czas przetwarzania paragonu: ~30-60 sekund.

### 3. Testowanie

📡 Dokumentacja API
Po uruchomieniu serwera, pełna dokumentacja Swagger UI jest dostępna pod adresem:
```bash
http://localhost:8080/docs
```

Główny Endpoint:
POST /api/v1.0/ai/ocr/process

Input: Plik obrazka (Form Data: file)

Output: JSON z listą produktów.