# Kampus.VC — Incident Response & Operational Recovery Manual

This playbook defines emergency incident response procedures, security escalation protocols, rollback steps, and financial reconciliation recovery for Kampus.VC.

---

## 1. Incident Severity Definitions

- **SEV-1 (Critical)**: Production backend offline, database corruption, active security breach, or payment processor webhook failure impacting customer money.
- **SEV-2 (High)**: Major feature unavailable (e.g. AI brief generation down, media upload failures) without workaround.
- **SEV-3 (Medium)**: Intermittent UI degradation or minor notification delivery delays.

---

## 2. Emergency Escalation & Rollback Procedures

### Step 1: Containment & Traffic Redirection
If a deployment fails or exposes critical bugs:
1. Revert DNS/CDNs or static hosting routing to the last known stable deployment tag.
2. In Railway/Render/AWS, trigger rollback to the previous container image SHA.

### Step 2: Secret Rotation Protocol
If a secret key is suspected of being compromised (e.g. `JWT_SECRET`, `RAZORPAY_WEBHOOK_SECRET`):
1. Immediately regenerate the secret key in the provider admin console.
2. Inject updated key into production environment variables.
3. Restart backend services (`npm start` / container reload) to invalidate all existing sessions and webhook validation contexts.

---

## 3. Financial Discrepancy & Reconciliation Recovery

### Executing Financial Reconciliation Engine
If a payment webhook fails or network timeouts cause state mismatch between Razorpay and internal milestones:
1. Login to Admin Dashboard.
2. Trigger `/api/v1/admin/reconcile` POST request.
3. The engine inspects provider payment logs against `FinancialLedgerEntry` append-only records, flags missing captures, and generates audit exception reports.
