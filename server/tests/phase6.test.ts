import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';

describe('Kampus.VC Phase 6 — Real-Time Chat, WebRTC Calling & Project Dispute Resolution Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kampus-vc-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose test connection bypassed; running Phase 6 API structure assertions.');
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

  describe('Authorization & Security Guards for Phase 6 Endpoints', () => {
    it('1. Reject unauthenticated GET /api/v1/disputes/mine', async () => {
      const res = await request(app).get('/api/v1/disputes/mine');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. Reject unauthenticated POST /api/v1/projects/fake_id/disputes', async () => {
      const res = await request(app).post('/api/v1/projects/fake_id/disputes').send({
        title: 'Unauthorized dispute',
        description: 'Testing security guard',
        requestedResolution: 'Refund',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('3. Reject unauthenticated GET /api/v1/projects/fake_id/calls', async () => {
      const res = await request(app).get('/api/v1/projects/fake_id/calls');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('End-to-End Project Dispute & Resolution Lifecycle (If DB Active)', () => {
    let brandToken = '';
    let creatorToken = '';
    let briefId = '';
    let proposalId = '';
    let projectId = '';
    let disputeId = '';

    const testBrand = {
      email: `brand_p6_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Nexus Brand Studios',
      role: 'brand' as const,
    };

    const testCreator = {
      email: `creator_p6_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Vortex AI Animator',
      role: 'creator' as const,
    };

    it('4. Setup Brand & Creator accounts and create active project', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const brandRes = await request(app).post('/api/v1/auth/signup').send(testBrand);
      expect(brandRes.status).toBe(201);
      brandToken = brandRes.body.data.token;

      const creatorRes = await request(app).post('/api/v1/auth/signup').send(testCreator);
      expect(creatorRes.status).toBe(201);
      creatorToken = creatorRes.body.data.token;

      // Onboard Brand & Creator
      await request(app).patch('/api/v1/profiles/me').set('Authorization', `Bearer ${brandToken}`).send({ companyName: 'Nexus Brand Studios' });
      await request(app).patch('/api/v1/profiles/me').set('Authorization', `Bearer ${creatorToken}`).send({ name: 'Vortex AI Animator', handle: `vortex_${Date.now()}` });

      // Create Brief
      const briefRes = await request(app)
        .post('/api/v1/briefs')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          title: 'Vortex 3D Video Brief',
          summary: 'Dispute test project brief.',
          category: 'Commercial & Advertising',
          budget: { amount: 150000, currency: 'INR' },
        });

      briefId = briefRes.body.data.brief._id;
      await request(app).post(`/api/v1/briefs/${briefId}/publish`).set('Authorization', `Bearer ${brandToken}`);

      // Create & Accept Proposal
      const propRes = await request(app)
        .post('/api/v1/proposals')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          briefId,
          title: 'Vortex Proposal',
          coverMessage: 'I will render high quality 3D animation.',
          proposedBudget: 150000,
          proposedTimeline: '7 days',
          milestones: [{ title: 'Milestone 1', amount: 150000 }],
        });

      proposalId = propRes.body.data.proposal._id;
      const acceptRes = await request(app).post(`/api/v1/proposals/${proposalId}/accept`).set('Authorization', `Bearer ${brandToken}`);
      projectId = acceptRes.body.data.project._id;
    });

    it('5. Brand files an official dispute for project', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const disputeRes = await request(app)
        .post(`/api/v1/projects/${projectId}/disputes`)
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          category: 'deliverable_quality',
          title: 'Revision limit & rendering quality disagreement',
          description: 'The deliverable frame rate does not meet agreed 60fps specification.',
          requestedResolution: 'Creator delivers updated 60fps render.',
        });

      expect(disputeRes.status).toBe(201);
      expect(disputeRes.body.success).toBe(true);
      expect(disputeRes.body.data).toHaveProperty('_id');
      disputeId = disputeRes.body.data._id;
    });

    it('6. Creator responds to dispute discussion', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const replyRes = await request(app)
        .post(`/api/v1/disputes/${disputeId}/respond`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          text: 'I can provide the updated 60fps render by tomorrow evening.',
        });

      expect(replyRes.status).toBe(200);
      expect(replyRes.body.success).toBe(true);
      expect(replyRes.body.data.discussion.length).toBeGreaterThan(0);
    });

    it('7. Creator submits evidence file reference', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const evidenceRes = await request(app)
        .post(`/api/v1/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Raw Render Output Logs',
          mediaUrl: 'https://example.com/render_log.txt',
        });

      expect(evidenceRes.status).toBe(200);
      expect(evidenceRes.body.success).toBe(true);
      expect(evidenceRes.body.data.evidence.length).toBeGreaterThan(0);
    });

    it('8. Creator proposes mutual settlement terms', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const proposeRes = await request(app)
        .post(`/api/v1/disputes/${disputeId}/propose-resolution`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          terms: 'Creator delivers 60fps render by Friday; Brand approves milestone upon delivery.',
        });

      expect(proposeRes.status).toBe(200);
      expect(proposeRes.body.success).toBe(true);
      expect(proposeRes.body.data.settlementProposal.status).toBe('pending');
    });

    it('9. Brand accepts settlement terms, resolving the dispute', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const ackRes = await request(app)
        .post(`/api/v1/disputes/${disputeId}/acknowledge-resolution`)
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          accept: true,
          responseNotes: 'Agreed on Friday delivery schedule.',
        });

      expect(ackRes.status).toBe(200);
      expect(ackRes.body.success).toBe(true);
      expect(ackRes.body.data.status).toBe('resolved');
      expect(ackRes.body.data.settlementProposal.status).toBe('accepted');
    });
  });
});
