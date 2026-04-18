.PHONY: help install setup dev db-setup db-migrate db-seed db-reset clean env-setup docker-env docker-build docker-up docker-down docker-logs docker-restart docker-clean

# Default target - show help
help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║            Alkhidmat 360 - Project Commands                   ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Quick Start (for new developers):"
	@echo "  Local:  1. make setup      - Complete setup (install deps + database)"
	@echo "          2. make dev        - Start development servers"
	@echo "  Docker: 1. make docker-up  - Start all services with Docker"
	@echo ""
	@echo "Local Development Commands:"
	@echo "  make install       - Install all dependencies (client + server)"
	@echo "  make env-setup     - Copy .env.example to .env files"
	@echo "  make setup         - Complete setup (install + env + database)"
	@echo "  make dev           - Start development servers (client + server)"
	@echo "  make db-setup      - Setup database (run migrations)"
	@echo "  make db-migrate    - Create and run new migration"
	@echo "  make db-seed       - Seed database with initial data"
	@echo "  make db-reset      - Reset database (drop + migrate + seed)"
	@echo "  make clean         - Clean node_modules and build artifacts"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-env    - Verify Docker env files (auto-created)"
	@echo "  make docker-build  - Build all Docker images"
	@echo "  make docker-up     - Start all services (builds if needed)"
	@echo "  make docker-down   - Stop all services"
	@echo "  make docker-restart- Restart all services"
	@echo "  make docker-logs   - View logs from all services"
	@echo "  make docker-clean  - Remove containers, images, and volumes"
	@echo ""
	@echo "  make help          - Show this help message"
	@echo ""

# Setup environment files
env-setup:
	@echo "🔧 Setting up environment files..."
	@if [ ! -f server/.env ]; then \
		echo "Creating server/.env from .env.example..."; \
		cp server/.env.example server/.env; \
		echo "⚠️  Please update server/.env with your database credentials!"; \
	else \
		echo "✓ server/.env already exists"; \
	fi
	@if [ ! -f client/.env ]; then \
		echo "Creating client/.env from .env.example..."; \
		cp client/.env.example client/.env; \
	else \
		echo "✓ client/.env already exists"; \
	fi
	@echo "✅ Environment files ready!"
	@echo ""

# Install all dependencies
install:
	@echo "📦 Installing dependencies..."
	@echo "Installing root dependencies..."
	npm install
	@echo ""
	@echo "Installing server dependencies..."
	cd server && npm install
	@echo ""
	@echo "Installing client dependencies..."
	cd client && npm install
	@echo ""
	@echo "✅ All dependencies installed!"

# Complete setup for new developers
setup: env-setup install db-setup
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║                   Setup Complete! ✅                          ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Update server/.env with your database credentials"
	@echo "  2. Run 'make dev' to start the development servers"
	@echo ""

# Setup database
db-setup:
	@echo "🗄️  Setting up database..."
	@echo "Running Prisma migrations..."
	cd server && npx prisma migrate deploy
	@echo ""
	@echo "Generating Prisma client..."
	cd server && npx prisma generate
	@echo ""
	@echo "✅ Database setup complete!"

# Create and run new migration
db-migrate:
	@echo "🗄️  Creating new migration..."
	@read -p "Enter migration name: " name; \
	cd server && npx prisma migrate dev --name $$name

# Seed database with initial data
db-seed:
	@echo "🌱 Seeding database..."
	cd server && npx prisma db seed
	@echo "✅ Database seeded successfully!"

# Reset database (drop, migrate, seed)
db-reset:
	@echo "⚠️  This will delete all data in the database!"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "🗑️  Resetting database..."; \
		cd server && npx prisma migrate reset --force; \
		echo "✅ Database reset complete!"; \
	else \
		echo "❌ Database reset cancelled."; \
	fi

# Start development servers
dev:
	@echo "🚀 Starting development servers..."
	@echo "Client: http://localhost:5173"
	@echo "Server: http://localhost:5000"
	@echo ""
	npm run dev

# Clean all node_modules and build artifacts
clean:
	@echo "🧹 Cleaning project..."
	@echo "Removing node_modules..."
	rm -rf node_modules
	rm -rf client/node_modules
	rm -rf server/node_modules
	@echo ""
	@echo "Removing build artifacts..."
	rm -rf client/dist
	rm -rf server/dist
	@echo ""
	@echo "✅ Clean complete!"

# ============================================
# DOCKER COMMANDS
# ============================================

# Verify Docker environment files exist
docker-env:
	@echo "🔧 Verifying Docker environment files..."
	@if [ ! -f server/.env.docker ]; then \
		echo "❌ server/.env.docker not found!"; \
		echo "This file should exist in the repository."; \
		exit 1; \
	else \
		echo "✓ server/.env.docker exists"; \
	fi
	@if [ ! -f client/.env.docker ]; then \
		echo "❌ client/.env.docker not found!"; \
		echo "This file should exist in the repository."; \
		exit 1; \
	else \
		echo "✓ client/.env.docker exists"; \
	fi
	@echo "✅ All Docker environment files ready!"
	@echo ""

# Build Docker images
docker-build: docker-env
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Docker images built successfully!"

# Start all services with Docker
docker-up: docker-env
	@echo "🐳 Starting all services with Docker..."
	@echo "Client: http://localhost:5173"
	@echo "Server: http://localhost:5000"
	@echo "MySQL: localhost:3307"
	@echo ""
	docker-compose up -d --build
	@echo ""
	@echo "✅ All services started!"
	@echo "View logs with: make docker-logs"

# Stop all Docker services
docker-down:
	@echo "🛑 Stopping all Docker services..."
	docker-compose down
	@echo "✅ All services stopped!"

# Restart all Docker services
docker-restart:
	@echo "🔄 Restarting all Docker services..."
	docker-compose restart
	@echo "✅ All services restarted!"

# View logs from all services
docker-logs:
	@echo "📋 Viewing Docker logs (Ctrl+C to exit)..."
	docker-compose logs -f

# Clean Docker containers, images, and volumes
docker-clean:
	@echo "⚠️  This will remove all Docker containers, images, and volumes!"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "🗑️  Cleaning Docker resources..."; \
		docker-compose down -v --rmi all; \
		echo "✅ Docker cleanup complete!"; \
	else \
		echo "❌ Docker cleanup cancelled."; \
	fi
