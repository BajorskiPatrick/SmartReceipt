# 🧾 SmartReceipt AI Module

**SmartReceipt AI Module** to mikroserwis oparty na AI do analizy i kategoryzacji paragonów.  
Pełni rolę backendowego silnika przetwarzania obrazu dla aplikacji **SmartReceipt**.

---

## 🧠 Technologia

Silnik opiera się na trzech głównych filarach:

### 1. OCR — `PaddleOCR`
Modele detekcji tekstu są **wbudowane w obraz** (*Zero-Download Startup*), co zapewnia:
- błyskawiczny start kontenera (offline ready)
- brak pobierania modeli przy uruchomieniu

### 2. LLM — `Llama 3.1 8B Instruct (Q4_K_M)`
Model językowy odpowiedzialny za strukturyzację danych:
- wyciąganie produktów, cen i ilości
- eksport do formatu JSON

**Feature:**
- **Hybrid Mode (GPU Offloading)** — umożliwia uruchomienie modelu 8B nawet na kartach z **4 GB VRAM**

### 3. NLP — `SetFit`
Model do semantycznej klasyfikacji produktów, np.  
*„Mleko” → „Spożywcze”*

---

## 🚀 Uruchamianie (Docker)

Projekt jest w pełni skonteneryzowany. Wymagany jest jedynie **Docker**.

### 1️⃣ Pobieranie / Budowanie obrazu

> ⚠️ Obraz zawiera „wypieczone” modele Llama, SetFit oraz PaddleOCR (~6 GB),  
> dlatego budowa lub pobieranie może potrwać kilkanaście minut.

#### 🔹 Opcja A: Pobranie gotowego obrazu (szybka)

```bash
docker pull ghcr.io/janbanasik/ai_module:latest
```

> ⚠️ Jeśli posiadasz starszy procesor / procesor używający innej architektury i po uruchomieniu pojawi się błąd **Exit 132**,  
> skorzystaj z opcji B.

#### 🔹 Opcja B: Budowanie lokalne (zalecane)

Buduje binarki dopasowane do Twojego procesora  
(rozwiązuje problemy z instrukcjami AVX / AVX2).

```bash
docker build -t ai_module .
```

---

### 2️⃣ Uruchamianie kontenera (wybierz tryb)

> Jeśli budowałeś lokalnie, zamień  
> `ghcr.io/janbanasik/ai_module:latest` → `ai_module`

#### ✅ Opcja A: NVIDIA GPU (4 GB VRAM) — **ZALECANE**
Tryb hybrydowy: część modelu w GPU, reszta w RAM.

```bash
docker run --rm --gpus all \
  -e SR_GPU_LAYERS=15 \
  -p 8000:8000 \
  --name receipt_ai \
  ghcr.io/janbanasik/ai_module:latest
```

#### 🏎️ Opcja B: NVIDIA GPU (8 GB+ VRAM)
Cały model ładowany do GPU — maksymalna wydajność.  
⏱️ ~2–3 sekundy na paragon

```bash
docker run --rm --gpus all \
  -e SR_GPU_LAYERS=33 \
  -p 8000:8000 \
  --name receipt_ai \
  ghcr.io/janbanasik/ai_module:latest
```

#### 🐢 Opcja C: Tryb CPU (brak GPU)
Działa na każdym komputerze, ale znacznie wolniej.  
⏱️ ~60–90 sekund na paragon

> ℹ️ W logach może pojawić się komunikat:  
> `WARNING: The NVIDIA Driver was not detected.`  
> Jest to normalne — system automatycznie przełączy się na CPU.

```bash
docker run --rm \
  -e SR_GPU_LAYERS=0 \
  -p 8000:8000 \
  --name receipt_ai \
  ghcr.io/janbanasik/ai_module:latest
```

---

## ⚙️ Konfiguracja (zmienne środowiskowe)

| Zmienna         | Domyślnie | Opis |
|-----------------|-----------|------|
| `SR_GPU_LAYERS` | `15` | Liczba warstw modelu ładowanych do VRAM<br>`0` → CPU only<br>`15` → Hybrid (4 GB GPU)<br>`33` → Full GPU (8 GB+) |

---

## 📡 Dokumentacja API

Po uruchomieniu serwera dostępna jest interaktywna dokumentacja Swagger UI:

👉 **http://localhost:8000/docs**

### 🔹 Główny endpoint

**POST** `/api/v1/ocr/process`

**Input:** `multipart/form-data`  
- `file` — obraz paragonu

**Output:** JSON zawierający listę produktów i przypisane kategorie.

#### 📄 Przykładowa odpowiedź

```json
{
  "items": [
    {
      "productName": "Mleko 3.2%",
      "price": 3.99,
      "quantity": 2.0,
      "category": "Spożywcze"
    }
  ]
}
```
