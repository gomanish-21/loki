# Makefile for JSON & SQL Formatter Docker Management

.PHONY: help build up down restart logs clean dev prod test

# Default target
help:
	@echo "Available commands:"
	@echo "  build    - Build Docker images"
	@echo "  up       - Start all services (production)"
	@echo "  down     - Stop all services"
	@echo "  restart  - Restart all services"
	@echo "  logs     - Show logs from all services"
	@echo "  clean    - Remove containers, networks, and volumes"
	@echo "  dev      - Start development environment"
	@echo "  prod     - Start production environment"
	@echo "  test     - Run tests"
	@echo "  shell    - Open shell in app container"
	@echo "  mongo    - Open MongoDB shell"
	@echo "  backup   - Create MongoDB backup"
	@echo "  restore  - Restore MongoDB from backup"

# Build Docker images
build:
	docker-compose build

# Start production environment
up:
	docker-compose up -d

# Start development environment
dev:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Start production environment with production compose file
prod:
	docker-compose -f docker-compose.prod.yml up -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# Show logs from all services
logs:
	docker-compose logs -f

# Show logs from specific service
logs-app:
	docker-compose logs -f app

logs-mongo:
	docker-compose logs -f mongodb

# Remove containers, networks, and volumes
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Run tests
test:
	docker-compose exec app python -m pytest

# Open shell in app container
shell:
	docker-compose exec app /bin/bash

# Open MongoDB shell
mongo:
	docker-compose exec mongodb mongosh --username admin --password password123 --authenticationDatabase admin formatter_db

# Create MongoDB backup
backup:
	mkdir -p mongo-backup
	docker-compose exec mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db formatter_db --out /backup/$(shell date +%Y%m%d_%H%M%S)

# Restore MongoDB from backup
restore:
	@echo "Usage: make restore BACKUP_FILE=backup_file_name"
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE"; exit 1; fi
	docker-compose exec mongodb mongorestore --username admin --password password123 --authenticationDatabase admin --db formatter_db /backup/$(BACKUP_FILE)

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/ || echo "App is not responding"
	@docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" --quiet || echo "MongoDB is not responding"

# Install dependencies locally (for development)
install:
	pip install -r requirements.txt

# Run locally (without Docker)
run-local:
	python main.py

# Format code
format:
	black .
	isort .

# Lint code
lint:
	flake8 .
	black --check .
	isort --check-only .

# Security check
security:
	bandit -r .

# Full development setup
setup-dev: install
	@echo "Setting up development environment..."
	@echo "1. Installing dependencies..."
	@echo "2. Starting MongoDB (if not running)..."
	@brew services start mongodb-community 2>/dev/null || echo "MongoDB not installed via Homebrew"
	@echo "3. Creating .env file..."
	@cp env.example .env 2>/dev/null || echo ".env file already exists"
	@echo "Development setup complete!"

# Production setup
setup-prod:
	@echo "Setting up production environment..."
	@echo "1. Building Docker images..."
	@make build
	@echo "2. Starting production services..."
	@make prod
	@echo "3. Waiting for services to be ready..."
	@sleep 10
	@make health
	@echo "Production setup complete!"

# Quick start (development)
quick-start: setup-dev
	@echo "Starting application..."
	@make run-local 