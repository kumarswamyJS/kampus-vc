# Kampus.VC — AI-Powered Creator Marketplace

> **Phase 1 Complete**: Project Initialization & Premium Design Foundation

Kampus.VC is an AI-powered creator marketplace connecting digital AI visual artists, filmmakers, animators, video editors, and 3D visual designers with visionary brands, businesses, and creative agencies.

---

## 🚀 Tech Stack

### Frontend Application (`/client`)
- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Dark-first aesthetics, glassmorphism, custom neon color tokens)
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form + Zod
- **API Client:** Typed Axios client with network failure resiliency

### Backend Application (`/server`)
- **Runtime:** Node.js v22+, Express, TypeScript
- **Database:** MongoDB + Mongoose (configured via `MONGODB_URI` with graceful runtime fallback if disconnected)
- **Validation & Environment:** Zod schema validation
- **Testing:** Jest + Supertest (Backend API health tests)
- **Security & Logging:** CORS origin restrictions, body size limits, sanitized request logger

---

## 📁 Repository Folder Structure

```
hachthon/
├── package.json               # Monorepo root script runner
├── README.md                  # Comprehensive documentation
├── .gitignore                 # Git ignore configuration
├── .env.example               # Root environment variable template
├── docs/
│   └── ARCHITECTURE.md        # System architecture, data flow & future module specs
├── client/                    # Frontend Vite + React + TS app
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── assets/            # High-res generated AI art showcase imagery
│   └── src/
│       ├── main.tsx
│       ├── index.css          # Design system CSS tokens & dark glassmorphism
│       ├── App.tsx            # React router setup & page boundaries
│       ├── types/             # Shared TypeScript types
│       ├── config/            # Frontend environment configuration
│       ├── services/          # Resilient Axios API client
│       ├── components/
│       │   ├── ui/            # Reusable primitive UI components (Button, Card, Input, Badge, Dialog, Dropdown, etc.)
│       │   ├── layout/        # Navbar with API health indicator, Footer with policy modals, AppLayout
│       │   └── landing/       # HeroSection, CreatorPreviewSection, HowItWorksSection, DifferentiationSection, ValuePropsSection, CTASection
│       └── pages/             # LandingPage, ExplorePage, CreatorsPage, BrandsPage, HowItWorksPage, LoginPage, SignupPage, ComingSoonPage
└── server/                    # Backend Express + TS app
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.js
    ├── src/
    │   ├── server.ts          # Server entry point with graceful shutdown
    │   ├── app.ts             # Express application & router middleware
    │   ├── config/            # Environment (Zod validated) & Database setup
    │   ├── middleware/        # Request logger, error handler, 404 handler
    │   ├── controllers/       # Health check controller
    │   ├── routes/            # Health route definitions (/api/health)
    │   └── models/            # Base Mongoose schemas (Creator, Brand)
    └── tests/
        └── health.test.ts     # Health API integration test suite
```

---

## ⚙️ Environment Variables

Copy `.env.example` to create your local configuration:

```bash
# Server Environment
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/kampus-vc

# Frontend Environment (Vite)
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Kampus.VC
```

---

## 🛠️ Installation & Running the Project

### 1. Installation
Install root and sub-application dependencies in one command:
```bash
npm run setup
```
*(Or install individually: `cd client && npm install`, `cd server && npm install`)*

### 2. Running in Development Mode
Run both frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Running Production Build & Verification
```bash
npm run build
```

### 4. Running Backend Tests
```bash
npm run test
```

---

## 🎯 Verification Results (Executed)

- **Frontend TypeScript & Build check (`npm run build:frontend`):** Clean compilation without errors.
- **Backend TypeScript & Build check (`npm run build:backend`):** Clean compilation without errors.
- **Backend Jest Health Tests (`npm run test`):** 100% passing tests for `/api/health` and 404 handler.
