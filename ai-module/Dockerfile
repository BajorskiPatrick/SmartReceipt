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

# 5. Kopiujemy konfigurację (dla Cache)
COPY pyproject.toml .
# COPY uv.lock .  <-- Jeśli masz, odkomentuj

# 6. Konfiguracja Venv
ENV VIRTUAL_ENV=/app/.venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# 7. Instalacja zależności
# Najpierw zwykłe
RUN uv pip install -r pyproject.toml

# Potem FIX na Llamę i Numpy (nadpisanie)
RUN uv pip install \
    llama-cpp-python \
    "numpy<2.0.0" \
    --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124 \
    --force-reinstall

# 8. Kopiujemy kod (dopiero teraz, żeby nie psuć cache przy zmianie kodu)
COPY app ./app

# 9. FIX OSTATECZNY: Naprawiamy ścieżki bibliotek (VENV > System)
# Dodałem tu: cufft, curand, cusolver, cusparse (YOLO ich potrzebuje!)
ENV LD_LIBRARY_PATH=/app/.venv/lib/python3.10/site-packages/nvidia/cuda_runtime/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cublas/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cudnn/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cufft/lib:/app/.venv/lib/python3.10/site-packages/nvidia/curand/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cusolver/lib:/app/.venv/lib/python3.10/site-packages/nvidia/cusparse/lib:/usr/local/nvidia/lib:/usr/local/nvidia/lib64

# 10. Start
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]