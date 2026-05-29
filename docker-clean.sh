#!/bin/bash

echo "🧹 Stop all running containers..."
docker stop $(docker ps -q) 2>/dev/null

echo "🧹 Remove all containers..."
docker rm -f $(docker ps -aq) 2>/dev/null

echo "🧹 Remove dangling images..."
docker image prune -f

echo "🧹 Optional: remove unused images (FULL CLEAN)..."
read -p "Remove ALL unused images? (y/N): " confirm

if [ "$confirm" = "y" ]; then
  docker image prune -a -f
  echo "🔥 Full image cleanup done"
else
  echo "👍 Skipped full image cleanup"
fi

echo "✅ Docker cleanup finished!"