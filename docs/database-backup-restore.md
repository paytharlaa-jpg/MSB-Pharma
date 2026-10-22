# MSB PHARMACHEM — Database Backup and Disaster Recovery Guide

## 1. Local / SQLite Backup & Restore Procedure

### 1.1 Automated Backup
Run the backup script:
```powershell
# Copy database file to timestamped backup directory
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
New-Item -ItemType Directory -Force -Path "backups"
Copy-Item "dev.db" "backups/dev_backup_$timestamp.db"
Write-Output "Backup successfully saved to backups/dev_backup_$timestamp.db"
```

### 1.2 Restore Procedure
1. Stop the application server (`npm run stop` or terminate process).
2. Archive the current corrupted/damaged `dev.db` file to `dev_damaged.db`.
3. Copy the desired backup file from `backups/dev_backup_<timestamp>.db` to `dev.db`.
4. Run `npx prisma db push` to verify schema alignment.
5. Restart the server (`npm run start`).

---

## 2. Production PostgreSQL Backup & Restore

### 2.1 Automated pg_dump Command
```bash
pg_dump -U username -h hostname -d msb_pharma -F c -b -v -f /backups/msb_pharma_$(date +%Y%m%d_%H%M%S).dump
```

### 2.2 Restoration Test
```bash
pg_restore -U username -h hostname -d msb_pharma_test -v /backups/msb_pharma_latest.dump
```
