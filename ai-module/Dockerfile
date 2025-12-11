# 1. Baza: Oficjalny obraz NVIDIA
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

# 2. Konfiguracja środowiska
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Instalacja zależności systemowych
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 4. Instalacja 'uv'
RUN pip3 install uv

WORKDIR /app

# 5. Kopiujemy konfigurację
COPY pyproject.toml .
# COPY uv.lock .

# 6. Konfiguracja Venv
ENV VIRTUAL_ENV=/app/.venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# 7. Instalacja zależności
RUN uv pip install -r pyproject.toml

RUN uv pip install \
    llama-cpp-python \
    "numpy<2.0.0" \
    --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124 \
    --force-reinstall

# --- NOWOŚĆ: TO JEST TA BRAKUJĄCA CZĘŚĆ ---
# 7.5 Pobieranie modelu Llama (Cache'owane!)
# Instalujemy huggingface_hub (jeśli nie ma w pyproject.toml)
RUN pip3 install huggingface_hub

# Pobieramy model PROSTO do obrazu.
# Dzięki temu kolega nie musi go mieć na dysku.
RUN huggingface-cli download bartowski/Llama-3.2-3B-Instruct-GGUF \
    Llama-3.2-3B-Instruct-Q4_K_M.gguf \
    --local-dir /app/app/ocr/models \
    --local-dir-use-symlinks False
# ------------------------------------------

COPY data ./data
COPY scripts ./scripts
# Musimy stworzyć strukturę folderów dla outputu
RUN mkdir -p app/nlp/models

RUN python3 scripts/train_categorizer.py

# 8. Kopiujemy kod aplikacji
COPY app ./app

# 9. FIX OSTATECZNY: Naprawiamy ścieżki bibliotek
ENV LD_LIBRARY_PATH=/app/.venv/lib/python3.10/site-packages/nvidia/cuda_runtime/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cublas/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cudnn/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cufft/lib:/app/.venv/lib/python3.10/site-packages/nvidia/curand/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cusolver/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cusparse/lib:/usr/local/nvidia/lib:/usr/local/nvidia/lib64

# 10. Start
# UWAGA: Dla kolegi (wersja produkcyjna) usuń "--reload".
# "--reload" jest super dla Ciebie, ale na prodzie zjada zasoby.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]