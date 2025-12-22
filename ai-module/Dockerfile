# ==========================
# Stage 1: Builder / Training
# ==========================
FROM nvidia/cuda:12.4.1-devel-ubuntu22.04 AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MODEL_DIR=/app/models/my-receipt-categorizer \
    HF_HUB_ENABLE_HF_TRANSFER=1 \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# System libs (Podstawowe, bo nie musimy już kompilować Llamy)
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv libgl1 libglib2.0-0 git \
    libgomp1 libopenblas-base \
    && rm -rf /var/lib/apt/lists/*

# UV Setup
RUN pip3 install uv && uv venv $VIRTUAL_ENV
COPY pyproject.toml .
RUN uv pip install pip setuptools wheel

# 1. PyTorch
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124 "numpy<2.0.0"

# 2. Paddle (CPU) & Numpy Fix
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install "paddlepaddle>=2.6.0" "paddleocr>=2.7.0" "numpy<2.0.0" "protobuf<4.0.0"

# 3. LLAMA-CPP-PYTHON (Wersja SZYBKA - Wheel dla CUDA 12.4)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install "llama-cpp-python" \
    --index-strategy unsafe-best-match \
    --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124 \
    "numpy<2.0.0"

# 4. Reszta zależności
RUN --mount=type=cache,target=/root/.cache/uv \
    UV_HTTP_TIMEOUT=1000 uv pip install -r pyproject.toml "numpy<2.0.0"

# 5. HF Transfer
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install "huggingface-hub>=0.34.0,<0.35.0" hf_transfer "numpy<2.0.0"

# Pobieranie modeli
RUN mkdir -p /app/app/ocr/models
RUN --mount=type=cache,target=/root/.cache/huggingface \
    hf download bartowski/Meta-Llama-3.1-8B-Instruct-GGUF \
    Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \
    --local-dir /app/app/ocr/models

RUN mkdir -p /app/app/nlp/models/my-receipt-categorizer
RUN hf download Johnyyy123/smart-receipt-categorizer-v1 \
    --local-dir /app/app/nlp/models/my-receipt-categorizer

# Test Importu
RUN python3 -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='pl', use_gpu=False, show_log=False)"

COPY app ./app

# ==========================
# Stage 2: Runtime
# ==========================
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    NVIDIA_DRIVER_CAPABILITIES=compute,utility \
    FORCE_COLOR=1 \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    SR_GPU_LAYERS=-1

WORKDIR /app

# Biblioteki systemowe (minimalne)
RUN apt-get update && apt-get install -y \
    python3 libgl1 libglib2.0-0 libgomp1 libopenblas-base \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/app ./app
COPY --from=builder /root/.paddleocr /root/.paddleocr

CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]