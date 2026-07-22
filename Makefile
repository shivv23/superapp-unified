.PHONY: dev build test lint docker-build docker-up docker-down deploy clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start all services in development mode
	npm run dev

build: ## Build all packages
	npm run build

test: ## Run all tests
	npm run test

lint: ## Run linting across all packages
	npm run lint

docker-build: ## Build all Docker images
	docker compose build

docker-up: ## Start all services via Docker Compose
	docker compose up -d

docker-down: ## Stop all Docker Compose services
	docker compose down

deploy: ## Deploy to Kubernetes cluster
	kubectl apply -f infra/k8s/namespace.yaml
	kubectl apply -f infra/k8s/configmap.yaml
	kubectl apply -f infra/k8s/

clean: ## Remove node_modules, dist, and build artifacts
	-rm -rf node_modules apps/*/node_modules packages/*/node_modules
	-rm -rf apps/*/dist services/*/dist packages/*/dist
	-rm -rf apps/*/.next
