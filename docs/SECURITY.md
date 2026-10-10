# Kampus.VC — Security Architecture & Hardening Report

This document outlines the security controls, authentication/authorization lifecycle, data privacy standards, and threat prevention measures implemented in Kampus.VC.

---

## 1. Authentication Lifecycle
- **Password Hashing**: Uses Argon2id / bcrypt with strong salt rounds.
- **Session Tokens**: Transmitted via `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` (in HTTPS production) cookies to prevent XSS-based token theft.
- **Bearer Token Fallback**: Supported for mobile/API clients with strict expiration validation.

---

## 2. Role-Based Access Control (RBAC) & Authorization Matrix

| Endpoint Group | Visitor | Creator | Brand | Admin |
|---|---|---|---|---|
| `GET /api/v1/creators` | Yes | Yes | Yes | Yes |
| `POST /api/v1/briefs` | No | No | Yes | Yes |
| `POST /api/v1/proposals` | No | Yes | No | Yes |
| `POST /api/v1/payments/create-order` | No | No | Yes | Yes |
| `GET /api/v1/admin/*` | No | No | No | **Yes** |

---

## 3. Financial Security & Signature Verification
- **Payment Verification**: Webhook payloads are verified against raw request buffers using HMAC SHA256 cryptographic signatures.
- **Constant-Time Comparison**: Prevents timing side-channel attacks during signature matching.
- **Ledger Invariance**: `FinancialLedgerEntry` prevents direct updates/deletes; only append operations are permitted.

---

## 4. Input Validation & MIME Security
- Schema-based validation using Zod for all incoming controller payloads.
- Strict MIME type verification and size limits for media uploads to prevent remote code execution or file traversal attacks.
