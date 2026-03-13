#!/bin/bash
# ============================================================
# CivicLens — Deployment Script
# Called by CI/CD pipeline or manually
# Usage: ./scripts/deploy.sh
# ============================================================
set -euo pipefail

COMPOSE_FILE="/opt/civiclens/docker-compose.yml"
PROJECT_DIR="/opt/civiclens"

echo "🚀 CivicLens Deployment"
echo "========================"
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

cd "$PROJECT_DIR"

# Pull latest images
echo "📦 Pulling latest images..."
docker compose pull backend admin client

# Recreate application containers only (data services remain untouched)
echo "🔄 Recreating application containers..."
docker compose up -d --no-deps --force-recreate backend admin client caddy

# Wait for backend to be healthy
echo "⏳ Waiting for backend to become healthy..."
for i in {1..30}; do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend did not become healthy in time"
        docker compose logs --tail=50 backend
        exit 1
    fi
    sleep 2
done

# Run database migrations
echo "🗃️ Running database migrations..."
docker compose exec -T backend alembic upgrade head

# Verify all services
echo ""
echo "🏥 Verifying services..."
echo "========================"

check_service() {
    local name=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "  ✅ ${name}"
        return 0
    else
        echo "  ❌ ${name}"
        return 1
    fi
}

check_service "API Backend"     "http://localhost:8000/health"
check_service "Admin Dashboard" "http://localhost:3000"
check_service "Citizen Portal"  "http://localhost:80"

# Clean up old images
echo ""
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "✅ Deployment complete!"
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
