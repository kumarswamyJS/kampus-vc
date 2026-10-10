# Kampus.VC — Database Backup, Restoration, and Recovery

This document provides operational guidance for database backup routines, disaster restoration, and schema migration ordering.

---

## 1. Automated MongoDB Backup Procedures

### Using `mongodump` (Native Binary)
```bash
# Production Backup Execution
mongodump --uri="mongodb+srv://<user>:<password>@cluster0.mongodb.net/kampusvc" --out=/backups/kampusvc_$(date +%Y%m%d_%H%M%S) --gzip
```

### Scheduled Cron Strategy
Run automated daily backups at off-peak hours (02:00 UTC) retaining 30-day snapshot history.

---

## 2. Restoration & Data Integrity Verification

### Restoration Command
```bash
mongorestore --uri="mongodb+srv://<user>:<password>@cluster0.mongodb.net/kampusvc_restored" --gzip --dir=/backups/kampusvc_20261010_020000
```

### Post-Restoration Verification
1. Confirm index creation across `users`, `creators`, `brands`, `campaignbriefs`, `proposals`, `projects`, `financialledgerentries`, `messages`.
2. Execute balance reconciliation check via Admin endpoint `/api/v1/admin/reconcile`.
