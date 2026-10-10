# Kampus.VC — System Architecture & Future Module Specifications

## Executive Overview

Kampus.VC is an AI-powered creator marketplace designed to bridge digital AI artists, filmmakers, animators, video editors, and 3D visual artists with leading brands, agencies, and creative directors. 

This document defines the high-level architecture, module boundaries, data flow patterns, and integration specifications for current and future phases.

---

## System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                          CLIENT LAYER (Vite + React + TS)             |
|                                                                       |
|  +------------------+  +-------------------+  +--------------------+  |
|  |  Landing & Brand |  |  Creator Explorer |  |  Dashboard Shell   |  |
|  +------------------+  +-------------------+  +--------------------+  |
|                            | Axios API Client                         |
+----------------------------|------------------------------------------+
                             | REST API (HTTP / JSON)
                             v
+-----------------------------------------------------------------------+
|                          BACKEND LAYER (Express + TS)                 |
|                                                                       |
|  +------------------+  +-------------------+  +--------------------+  |
|  | Request Logging  |  |  CORS & Security  |  |  Zod Validation    |  |
|  +------------------+  +-------------------+  +--------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | API Controllers (/api/health, /api/v1/creators, /api/v1/briefs)  |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +------------------+  +-------------------+  +--------------------+  |
|  | Mongoose Models  |  |  Health Monitor   |  | Error Handler      |  |
|  +------------------+  +-------------------+  +--------------------+  |
+----------------------------|------------------------------------------+
                             | Database Driver
                             v
+-----------------------------------------------------------------------+
|                          DATA & SERVICES LAYER                        |
|                                                                       |
|  +------------------+  +-------------------+  +--------------------+  |
|  |  MongoDB Store   |  |  Cloudinary Storage| |  AI Vision & LLMs  |  |
|  | (State & Briefs) |  |   (Portfolios)    |  | (Vector Embeddings)|  |
|  +------------------+  +-------------------+  +--------------------+  |
+-----------------------------------------------------------------------+
```

---

## Data Flow & Boundaries

### 1. Frontend-Backend Boundary
- **Communication Protocol:** RESTful JSON HTTP endpoints exposed under `/api/v1`.
- **Stateless Authentication (Future):** JWT / OAuth Bearer Tokens passed in `Authorization: Bearer <token>` headers.
- **Client Resilience:** The frontend API client detects backend network reachability gracefully, providing fallback states without crashing UI views.

### 2. Database Connection Handling
- **MongoDB Connection:** Managed via Mongoose with standard retry strategies and lifecycle hooks (`connected`, `error`, `disconnected`).
- **Graceful DB Fallback:** Health check endpoint (`GET /api/health`) reports database connectivity separately from application runtime health.

---

## Future Module Boundaries & Roadmap

### 1. Authentication & Role Management (`/api/v1/auth`)
- Dual account roles: `creator` vs `brand`.
- Google OAuth 2.0 integration & passwordless magic link support.
- Role-based access control (RBAC) middleware for restricted endpoints.

### 2. Creator & Brand Profiles (`/api/v1/creators`, `/api/v1/brands`)
- **Creator Profiles:** Rich portfolio item showcases, primary AI tools (Midjourney, Runway Gen-3, Sora, ComfyUI, ElevenLabs, Luma Dream Machine), pricing models, verified credentials.
- **Brand Profiles:** Company identity, active campaign history, preferred creative styles, budget ranges.

### 3. Visual Style Analysis & AI Match Engine (`/api/v1/ai/match`)
- **Vector Embeddings:** Multimodal embeddings (CLIP / SigLIP) for portfolio artworks and brand brief descriptions.
- **Explainable Matching:** Matching scores backed by explicit breakdown metrics (Visual Aesthetic, Motion Style, Color Harmony, Tool Mastery, Turnaround Reliability).

### 4. Creative DNA Passport & Creative Time Machine
- **Creative DNA Passport:** Cryptographically signed, verifiable creator identity badge encoding verified tool proficiency, delivery rate, and style consistency.
- **Creative Time Machine:** Visual version control tracking prompt iterations, seed parameters, generation lineage, and prompt evolution for team review.

### 5. Campaign Briefs & AI Brief Generation (`/api/v1/briefs`)
- Interactive brief builder with AI prompt expansion, moodboard generation, target audience persona mapping, and deliverable specs formatting.

### 6. Reverse Marketplace & Proposals (`/api/v1/proposals`)
- Brands post open campaign briefs; creators submit structured AI-assisted proposals with draft keyframes, timeline milestones, and budget breakdowns.

### 7. Real-Time Collaboration & Communication (`/api/v1/messages`, WebRTC/Socket.IO)
- Socket.IO real-time chat with file attachment support.
- Peer-to-peer WebRTC video calls with live screen-sharing and interactive canvas feedback for creative directors.

### 8. Escrow Payments, Refunds & Licensing (`/api/v1/payments`)
- Razorpay test and production mode integration with milestone-based escrow release.
- Smart licensing contract generation (Exclusive, Non-Exclusive, Commercial Buyout, Regional AI rights).

### 9. Creator Verification & Dispute Management (`/api/v1/disputes`)
- Evidence-based portfolio verification checking asset creation lineage.
- Structured dispute resolution workflow with neutral mediator review and milestone lockup.

---

## Environment Variable Schema

| Variable | Scope | Description | Default |
|----------|-------|-------------|---------|
| `PORT` | Backend | Express HTTP Port | `5000` |
| `NODE_ENV` | Backend | Runtime Environment | `development` |
| `CLIENT_ORIGIN` | Backend | Allowed CORS Origin | `http://localhost:5173` |
| `MONGODB_URI` | Backend | MongoDB Connection String | `mongodb://localhost:27017/kampus-vc` |
| `VITE_API_URL` | Frontend | API Base Endpoint | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Frontend | Application Title | `Kampus.VC` |
