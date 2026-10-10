# Kampus.VC — Production Post-Deployment Smoke Test Protocol

This document provides a post-deployment verification checklist for ops engineers validating a newly deployed Kampus.VC environment.

---

## 1. Automated Health & Preflight Probes

### Liveness Probe
```bash
curl -i https://api.kampus.vc/api/health
```
**Expected Output**: `200 OK` with JSON body:
```json
{
  "status": "ok",
  "service": "Kampus.VC Backend API",
  "timestamp": "..."
}
```

### Database & Index Preflight Command
```bash
cd server && npm run db:preflight
```
**Expected Output**: `Exit Code 0`, confirming database connectivity and unique schema index synchronization.

---

## 2. End-to-End User Journey Verification

### Smoke Test 1: Public Discovery & Profiles
1. Load `https://kampus.vc/`. Confirm landing page assets and CSS load without console errors.
2. Navigate to `/creators` and `/briefs`. Confirm API fetch returns creator cards and open briefs.
3. Open a public creator profile (e.g. `/creator/<id>`). Verify Creative DNA Passport radar chart renders cleanly.

### Smoke Test 2: Brand Brief & AI Generation
1. Sign in as a test brand user (`brand@demo.com`).
2. Navigate to `/brand/dashboard` -> **"Create Brief"**.
3. Trigger **"AI Magic Enhance"** to test Gemini API integration (or fallback mechanism).
4. Save and publish brief. Verify brief status becomes `published`.

### Smoke Test 3: Creator Proposal & Matching
1. Sign in as a test creator user (`creator@demo.com`).
2. Navigate to `/briefs` and inspect creator match score breakdown.
3. Submit a proposal for the published brief.

### Smoke Test 4: Project Collaboration & Razorpay Checkout
1. Switch to Brand session and click **"Accept Proposal"**.
2. Verify project & milestone creation under `/projects/<id>`.
3. Test Socket.IO real-time chat under `/messages`.
4. Initiate Razorpay payment modal for Milestone 1. Confirm order creation API returns a valid Razorpay Order ID.

### Smoke Test 5: Admin Panel & Audit Trail
1. Sign in as Administrator (`admin@kampus.vc`).
2. Access `/api/v1/admin/dashboard`. Confirm system operational metrics and balance reconciliation tools are accessible.
