#!/bin/bash
# =================================================================
# Synology DS925+ One-Touch Enterprise Deployment Script
# Role: SDE-3 / Technical Executive Automation
# =================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "================================================================="
echo "🏢 Starting Production Deployment for Synology DS925+..."
echo "📂 Project Directory: ${PROJECT_ROOT}"
echo "================================================================="

cd "${PROJECT_ROOT}"

# 1. Ensure required NAS data storage directories exist
mkdir -p nas-data/mongodb
mkdir -p nas-data/redis
mkdir -p nas-data/backups

# Set write permissions for container UID
chmod -R 775 nas-data/ 2>/dev/null || true

# 2. Check for environment configuration
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Initializing from .env.nas.example..."
  cp .env.nas.example .env
  echo "✅ Created .env from .env.nas.example. Customize credentials as needed."
else
  echo "✅ Active .env configuration detected."
fi

# 3. Pull latest base images and build containers
echo "🔨 Building multi-tier container images (Frontend + Backend)..."
docker compose build --pull

# 4. Launch containers in detached mode
echo "🚀 Starting containers with orchestrated health-check DAG..."
docker compose up -d

echo "================================================================="
echo "⏳ Waiting for service health checks to converge (approx 15s)..."
echo "================================================================="

sleep 15
docker compose ps

echo "================================================================="
echo "✅ Deployment Successful!"
echo "🌐 Access Dashboard at: http://$(hostname -I | awk '{print $1}'):3080"
echo "📡 Backend API Health: http://$(hostname -I | awk '{print $1}'):5050/api/health"
echo "================================================================="

