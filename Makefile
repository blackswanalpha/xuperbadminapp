# ================================
# Makefile for Docker Operations
# ================================

.DEFAULT_GOAL := help
.PHONY: help build build-dev run run-dev up up-prod down logs clean

# Variables
PROJECT_NAME := xuperb-admin
DOCKER_IMAGE := $(PROJECT_NAME):latest
DOCKER_IMAGE_DEV := $(PROJECT_NAME):dev

help: ## Show this help message
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build production Docker image
	docker build -t $(DOCKER_IMAGE) .

build-dev: ## Build development Docker image
	docker build -f Dockerfile.dev -t $(DOCKER_IMAGE_DEV) .

build-no-cache: ## Build production image without cache
	docker build --no-cache -t $(DOCKER_IMAGE) .

run: ## Run production container
	docker run -p 3000:3000 --name $(PROJECT_NAME)-prod $(DOCKER_IMAGE)

run-dev: ## Run development container with volume mounting
	docker run -p 3000:3000 -v $$(pwd):/app -v /app/node_modules --name $(PROJECT_NAME)-dev $(DOCKER_IMAGE_DEV)

up: ## Start development environment with Docker Compose
	docker-compose up

up-build: ## Start development environment and build images
	docker-compose up --build

up-prod: ## Start production environment
	docker-compose -f docker-compose.prod.yml up --build

up-detached: ## Start development environment in background
	docker-compose up -d

down: ## Stop and remove containers
	docker-compose down

down-volumes: ## Stop containers and remove volumes
	docker-compose down -v

logs: ## Show container logs
	docker-compose logs -f

logs-web: ## Show web container logs only
	docker-compose logs -f web

shell: ## Access web container shell
	docker-compose exec web sh

shell-postgres: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U xuperb_user -d xuperb_admin

clean: ## Clean Docker system
	docker system prune -a

clean-volumes: ## Remove all unused volumes
	docker volume prune

restart: ## Restart all services
	docker-compose restart

rebuild: ## Rebuild and restart all services
	docker-compose down && docker-compose build --no-cache && docker-compose up

health: ## Check application health
	curl -s http://localhost:3000/api/health | jq '.' || echo "Health check failed"

test-build: ## Test if build works without running
	docker build --target deps -t $(PROJECT_NAME):deps-test .

# Database operations
db-backup: ## Backup database
	docker-compose exec postgres pg_dump -U xuperb_user xuperb_admin > backup_$$(date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database (requires BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE=filename.sql"; exit 1; fi
	docker-compose exec -T postgres psql -U xuperb_user xuperb_admin < $(BACKUP_FILE)

# Development helpers
install: ## Install dependencies locally
	npm install

dev: ## Start local development server
	npm run dev

lint: ## Run linting
	npm run lint

format: ## Format code (if prettier is configured)
	npm run format || echo "No format script found"

# Production deployment helpers
prod-deploy: ## Deploy production stack
	docker-compose -f docker-compose.prod.yml up -d --build

prod-logs: ## Show production logs
	docker-compose -f docker-compose.prod.yml logs -f

prod-down: ## Stop production stack
	docker-compose -f docker-compose.prod.yml down

# Monitoring
ps: ## Show running containers
	docker-compose ps

stats: ## Show container resource usage
	docker stats

images: ## Show Docker images
	docker images | grep $(PROJECT_NAME)

# Security
audit: ## Run npm security audit
	npm audit

update-deps: ## Update dependencies
	npm update

# Quick setup
setup: ## Initial setup (install deps and build)
	npm install && npm run build

setup-docker: ## Setup and start with Docker
	make build-dev && make up-build