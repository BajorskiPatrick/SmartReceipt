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

# System libs
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv libgl1 libglib2.0-0 git \
    build-essential cmake \
    && rm -rf /var/lib/apt/lists/*

# Creating virtualenv with uv
RUN pip3 install uv && uv venv $VIRTUAL_ENV

# Copying and installing dependencies
COPY pyproject.toml .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install -r pyproject.toml

ENV CMAKE_ARGS="-DGGML_CUDA=ON"
ENV FORCE_CMAKE=1

# Installing llama-cpp-python with CUDA support
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install \
    llama-cpp-python "numpy<2.0.0" \
    --no-binary llama-cpp-python \
    --force-reinstall

RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install "huggingface-hub>=0.34.0,<0.35.0" hf_transfer

# Installing models

# Install Llama model
RUN mkdir -p /app/app/ocr/models
RUN --mount=type=cache,target=/root/.cache/huggingface \
    hf download bartowski/Meta-Llama-3.1-8B-Instruct-GGUF \
    Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \
    --local-dir /app/app/ocr/models

# Install receipt categorizer model
RUN mkdir -p /app/app/nlp/models/my-receipt-categorizer
RUN hf download Johnyyy123/smart-receipt-categorizer-v1 \
    --local-dir /app/app/nlp/models/my-receipt-categorizer

# Installing paddle OCR and downloading OCR models
RUN python3 -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='pl', use_gpu=False, show_log=False)"

# Copying data and scripts
COPY data ./data
COPY app ./app

# ==========================
# Stage 2: Runtime / Serve
# ==========================
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    LLAMA_CUBLAS=1 \
    LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64 \
    NVIDIA_DRIVER_CAPABILITIES=compute,utility \
    FORCE_COLOR=1 \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    SR_GPU_LAYERS=15

WORKDIR /app

# System libs
RUN apt-get update && apt-get install -y \
    python3 libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# COPY --from=builder:
COPY --from=builder /app/.venv /app/.venv

# Copying models
COPY --from=builder /app/app ./app

COPY --from=builder /root/.paddleocr /root/.paddleocr

# Setting GPU layers for Llama model

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]