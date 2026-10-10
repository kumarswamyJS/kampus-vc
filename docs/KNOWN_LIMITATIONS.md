# Kampus.VC — Known Limitations & Architectural Boundaries

This document clearly outlines operational boundaries, third-party sandbox behaviors, and infrastructure requirements.

---

## 1. Payment Sandbox vs Live Payouts
- **Razorpay Sandbox**: Payments created using test Razorpay Key IDs (`rzp_test_...`) simulate checkout flows. Captured payments update the database project milestones.
- **Creator Transfer Payouts**: Automated Razorpay Route / Marketplace automated payouts require an active Razorpay Route production merchant account with KYC clearance. In local/sandbox mode, creator payout transfers are recorded as pending transfer records or sandbox simulated payouts until production credentials are configured.

---

## 2. WebRTC Connectivity & STUN/TURN Requirements
- **Local Testing**: WebRTC peer-to-peer audio/video calls succeed on local host networks using public Google STUN servers (`stun:stun.l.google.com:19302`).
- **Production Enterprise Networks**: Cross-NAT and strict firewall connections require a dedicated TURN server (e.g. Coturn).

---

## 3. Multi-Node Real-Time Socket Scaling
- Single-instance Node.js processes handle Socket.IO connections in memory.
- Multi-instance horizontal scaling requires `@socket.io/redis-adapter` with a Redis cluster backplane.

---

## 4. Escrow Legal Disclaimer
- Platform milestone holdings represent programmatic software escrow state tracking. Legal escrow compliance in specific jurisdictions requires licensed third-party financial custodians.
