# Kampus.VC — Production Deployment Guide

This guide details step-by-step instructions for deploying Kampus.VC to production environments.

---

## 1. System Requirements

- **Node.js**: v18.x or v20.x LTS
- **Database**: MongoDB v6.0+ (Atlas or self-hosted Replica Set required for transactions)
- **Object Storage**: Cloudinary (for production asset CDN)
- **Payment Gateway**: Razorpay (Live or Test Sandbox keypair)
- **AI Provider**: Google Gemini API key or OpenAI API key

---

## 2. Environment Variables Matrix

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/kampusvc?retryWrites=true&w=majority
JWT_SECRET=super-secure-production-jwt-secret-min-32-chars
CLIENT_URL=https://kampus.vc
COOKIE_DOMAIN=.kampus.vc

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=kampusvc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# AI Service Providers
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# Socket.IO & TURN (WebRTC)
TURN_SERVER_URL=turn:turn.kampus.vc:3478
TURN_SERVER_USERNAME=kampus_user
TURN_SERVER_CREDENTIAL=kampus_pass
```

### Frontend (`client/.env`)
```env
VITE_API_URL=https://api.kampus.vc/api/v1
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
```

---

## 3. Build & Deployment Commands

### Backend Build & Start
```bash
cd server
npm ci
npm run build
npm start
```

### Frontend Build & Serve
```bash
cd client
npm ci
npm run build
# Deploy dist/ directory to static host (Vercel, Cloudflare Pages, AWS S3/CloudFront)
```

---

## 4. Health & Readiness Endpoints
- **Liveness Probe**: `GET /api/v1/health` -> `200 OK {"status": "ok"}`
- **Readiness Probe**: Checks database connection state before returning `200 OK`.
