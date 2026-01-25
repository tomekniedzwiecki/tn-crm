#!/bin/bash
# Supabase Database Backup Script
# Wymaga: SUPABASE_DB_URL w zmiennych środowiskowych

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tn-crm-backup-$TIMESTAMP.sql"

# Utwórz katalog jeśli nie istnieje
mkdir -p $BACKUP_DIR

# Eksportuj bazę (wymaga pg_dump)
# SUPABASE_DB_URL format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
pg_dump "$SUPABASE_DB_URL" > "$BACKUP_FILE"

# Kompresuj
gzip "$BACKUP_FILE"

echo "Backup zapisany: ${BACKUP_FILE}.gz"

# Usuń backupy starsze niż 30 dni
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
