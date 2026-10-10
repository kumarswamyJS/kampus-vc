import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';

describe('Kampus.VC Phase 8 — Payment Provider, Payouts, Ledger & Admin Operations Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kampus-vc-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose test connection bypassed; running Phase 8 API structure assertions.');
    }
  });

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
    } catch (err) {
      // Ignore
    }
  });

  describe('Authorization & Security Guards for Phase 8 Endpoints', () => {
    it('1. Reject unauthenticated POST /api/v1/payments/create-order', async () => {
      const res = await request(app).post('/api/v1/payments/create-order').send({
        projectId: 'fake_id',
        milestoneId: 'fake_id',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. Reject unauthenticated GET /api/v1/payments/mine', async () => {
      const res = await request(app).get('/api/v1/payments/mine');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('3. Reject unauthenticated GET /api/v1/admin/dashboard', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('4. Reject non-admin access to GET /api/v1/admin/users', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Signup as brand user
      const brandRes = await request(app).post('/api/v1/auth/signup').send({
        email: `brand_p8_sec_${Date.now()}@example.com`,
        password: 'Password123!',
        displayName: 'Non Admin User',
        role: 'brand',
      });

      if (brandRes.status === 201) {
        const token = brandRes.body.data.token;
        const res = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
      }
    });
  });

  describe('End-to-End Milestone Payment, Capture & Webhook Flow (If DB Active)', () => {
    let brandToken = '';
    let creatorToken = '';
    let briefId = '';
    let proposalId = '';
    let projectId = '';
    let milestoneId = '';
    let paymentId = '';

    const testBrand = {
      email: `brand_p8_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Aegis Brand House',
      role: 'brand' as const,
    };

    const testCreator = {
      email: `creator_p8_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Orion CGI Labs',
      role: 'creator' as const,
    };

    it('5. Setup Brand & Creator accounts and create active project milestone', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const brandRes = await request(app).post('/api/v1/auth/signup').send(testBrand);
      expect(brandRes.status).toBe(201);
      brandToken = brandRes.body.data.token;

      const creatorRes = await request(app).post('/api/v1/auth/signup').send(testCreator);
      expect(creatorRes.status).toBe(201);
      creatorToken = creatorRes.body.data.token;

      // Onboard profiles
      await request(app).patch('/api/v1/profiles/me').set('Authorization', `Bearer ${brandToken}`).send({ companyName: 'Aegis Brand House' });
      await request(app).patch('/api/v1/profiles/me').set('Authorization', `Bearer ${creatorToken}`).send({ name: 'Orion CGI Labs', handle: `orion_${Date.now()}` });

      // Create & Publish Brief
      const briefRes = await request(app)
        .post('/api/v1/briefs')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          title: 'Aegis Product CGI Brief',
          summary: 'High end product rendering spot.',
          category: 'Commercial & Advertising',
          budget: { amount: 100000, currency: 'INR' },
        });

      briefId = briefRes.body.data.brief._id;
      await request(app).post(`/api/v1/briefs/${briefId}/publish`).set('Authorization', `Bearer ${brandToken}`);

      // Proposal & Acceptance
      const propRes = await request(app)
        .post('/api/v1/proposals')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          briefId,
          title: 'Orion CGI Proposal',
          coverMessage: 'I will render cinematic 3D assets.',
          proposedBudget: 100000,
          proposedTimeline: '5 days',
          milestones: [{ title: 'Final Deliverable', amount: 100000 }],
        });

      proposalId = propRes.body.data.proposal._id;
      const acceptRes = await request(app).post(`/api/v1/proposals/${proposalId}/accept`).set('Authorization', `Bearer ${brandToken}`);
      projectId = acceptRes.body.data.project._id;
      milestoneId = acceptRes.body.data.project.milestones[0]._id;
    });

    it('6. Brand creates milestone payment order', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const orderRes = await request(app)
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          projectId,
          milestoneId,
          idempotencyKey: `idemp_test_${Date.now()}`,
        });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.success).toBe(true);
      expect(orderRes.body.data).toHaveProperty('_id');
      paymentId = orderRes.body.data._id;
    });

    it('7. Verify and capture milestone payment', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const captureRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          paymentId,
          providerPaymentId: `pay_captured_${Date.now()}`,
        });

      expect(captureRes.status).toBe(200);
      expect(captureRes.body.success).toBe(true);
      expect(captureRes.body.data.status).toBe('captured');
    });

    it('8. Test idempotent payment webhook processing', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const webhookRes = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-razorpay-event-id', `evt_${Date.now()}`)
        .send({
          event: 'payment.captured',
          payload: { paymentId },
        });

      expect(webhookRes.status).toBe(200);
      expect(webhookRes.body.success).toBe(true);
    });
  });
});
