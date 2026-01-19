.DEFAULT_GOAL := help

# ---- Config ----
COMPOSE ?= docker compose
BASE_COMPOSE := docker-compose.yml
GPU_COMPOSE  := docker-compose.gpu.yml

FLAGS ?= --build

SR_GPU_LAYERS ?= 33

# Helper to pick compose files
COMPOSE_CPU := $(COMPOSE) -f $(BASE_COMPOSE)
COMPOSE_GPU := $(COMPOSE) -f $(BASE_COMPOSE) -f $(GPU_COMPOSE)

.PHONY: help
help:
	@echo "SmartReceipt Makefile"
	@echo ""
	@echo "Common:"
	@echo "  make up            Start stack (CPU/default)"
	@echo "  make gpu           Start stack (GPU AI)"
	@echo "  make down          Stop stack"
	@echo "  make logs          Follow logs (all services)"
	@echo "  make ps            Show container status"
	@echo "  make health        Check AI + backend endpoints"
	@echo ""
	@echo "Build / restart:"
	@echo "  make build         Build images (CPU/default)"
	@echo "  make build-gpu     Build images (GPU AI)"
	@echo "  make restart       Restart stack (CPU/default)"
	@echo "  make restart-gpu   Restart stack (GPU AI)"
	@echo ""
	@echo "Variables:"
	@echo "  FLAGS=...          Extra docker compose flags (default: --build)"
	@echo "  SR_GPU_LAYERS=...  GPU offload layers for AI (default: 33)"
	@echo ""
	@echo "Examples:"
	@echo "  make gpu"
	@echo "  make gpu SR_GPU_LAYERS=20"
	@echo "  make gpu FLAGS=\"--build --remove-orphans\""

# ---- CPU/default targets ----
.PHONY: up
up:
	$(COMPOSE_CPU) up -d $(FLAGS)

.PHONY: build
build:
	$(COMPOSE_CPU) build

.PHONY: restart
restart:
	$(COMPOSE_CPU) down
	$(COMPOSE_CPU) up -d $(FLAGS)

# ---- GPU targets ----
.PHONY: gpu
gpu:
	SR_GPU_LAYERS=$(SR_GPU_LAYERS) $(COMPOSE_GPU) up -d $(FLAGS)

.PHONY: build-gpu
build-gpu:
	SR_GPU_LAYERS=$(SR_GPU_LAYERS) $(COMPOSE_GPU) build

.PHONY: restart-gpu
restart-gpu:
	$(COMPOSE_GPU) down
	SR_GPU_LAYERS=$(SR_GPU_LAYERS) $(COMPOSE_GPU) up -d $(FLAGS)

# ---- Utility targets ----
.PHONY: down
down:
	$(COMPOSE_CPU) down

.PHONY: down-v
down-v:
	$(COMPOSE_CPU) down -v

.PHONY: ps
ps:
	$(COMPOSE_CPU) ps

.PHONY: logs
logs:
	$(COMPOSE_CPU) logs -f

.PHONY: logs-ai
logs-ai:
	$(COMPOSE_CPU) logs -f ai-module

.PHONY: logs-backend
logs-backend:
	$(COMPOSE_CPU) logs -f backend

.PHONY: logs-frontend
logs-frontend:
	$(COMPOSE_CPU) logs -f frontend

.PHONY: pull
pull:
	$(COMPOSE_CPU) pull

.PHONY: health
health:
	@echo "AI /health:" && curl -fsS http://localhost:8000/health && echo
	@echo "Backend swagger (HTTP code):" && curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:8080/api/v1.0/swagger-ui/index.html
	@echo "Frontend (HTTP code):" && curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:3000/

.PHONY: nvidia-smi
nvidia-smi:
	docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
