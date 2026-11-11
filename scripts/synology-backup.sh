#!/bin/bash
# =================================================================
# Synology DS925+ Automated Database Snapshot & Backup Utility
# Can be scheduled in DSM Control Panel -> Task Scheduler
# =================================================================

set -e

# Configuration
PROJECT_DIR="${1:-/volume1/docker/recruitment-dashboard}"
BACKUP_DIR="${PROJECT_DIR}/nas-data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/recruitment_backup_${TIMESTAMP}.tar.gz"

echo "=========================================================="
echo "Starting Database Backup for Recruitment Dashboard on DS925+..."
echo "Timestamp: ${TIMESTAMP}"
echo "=========================================================="

mkdir -p "${BACKUP_DIR}"

# Execute mongodump directly inside the mongo container
docker exec recruitment-mongo mongodump --db recruitment_dashboard --out /backups/dump_${TIMESTAMP}

# Compress the dump
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_FILE}" "dump_${TIMESTAMP}"
rm -rf "dump_${TIMESTAMP}"

echo "✅ Backup successfully created: ${BACKUP_FILE}"

# Retention Policy: Delete backups older than 14 days
find "${BACKUP_DIR}" -type f -name "recruitment_backup_*.tar.gz" -mtime +14 -exec rm {} \;
echo "🧹 Old backups pruned (Retention: 14 days)."
echo "=========================================================="

