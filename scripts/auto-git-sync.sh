#!/bin/bash
# =================================================================
# Synology DS925+ Automated Git Continuous Deployment (GitOps)
# Schedule in DSM Control Panel -> Task Scheduler to run every 2 mins
# =================================================================

# Change this to your exact project path on the NAS
PROJECT_DIR="${1:-/volume1/docker/recruitment-dashboard}"

cd "$PROJECT_DIR" || exit 1

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "Error: Directory $PROJECT_DIR is not a git repository."
  exit 1
fi

# Fetch remote changes silently
git fetch origin main > /dev/null 2>&1

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

# If hashes differ, a new commit has been pushed to GitHub
if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
  echo "================================================================="
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 New commit detected on GitHub!"
  echo "Local:  $LOCAL_HASH"
  echo "Remote: $REMOTE_HASH"
  echo "Pulling latest code..."
  
  git pull origin main
  
  echo "Rebuilding and restarting containers..."
  docker compose up -d --build
  
  echo "✅ Live deployment completed successfully!"
  echo "================================================================="
fi

