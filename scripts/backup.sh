#!/usr/bin/env bash
# ============================================================
#  Backup automatico del database SQLite
#  Uso: ./scripts/backup.sh
#  Cron giornaliero alle 03:00:
#    0 3 * * * /path/to/bar-gestionale/scripts/backup.sh >> /var/log/bar-backup.log 2>&1
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

DB_FILE="${DB_PATH:-$PROJECT_DIR/db/bar.db}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/db/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERRORE: database non trovato in $DB_FILE"
  exit 1
fi

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DEST="$BACKUP_DIR/bar_${TIMESTAMP}.db"

# sqlite3 .backup è sicuro anche con WAL attivo
sqlite3 "$DB_FILE" ".backup '$DEST'"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completato: $DEST"

# Rimuovi backup più vecchi di RETENTION_DAYS giorni
find "$BACKUP_DIR" -name "bar_*.db" -mtime +"$RETENTION_DAYS" -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pulizia backup più vecchi di $RETENTION_DAYS giorni completata"
