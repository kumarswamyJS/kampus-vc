import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';

describe('Kampus.VC Phase 5 — AI Creator Matching, Proposals, Projects & Escrow Ledger Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kampus-vc-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose test connection bypassed; running Phase 5 API structure assertions.');
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

  describe('Authorization & Security Guards for Phase 5 Endpoints', () => {
    it('1. Reject unauthenticated GET /api/v1/matching/me', async () => {
      const res = await request(app).get('/api/v1/matching/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. Reject unauthenticated POST /api/v1/proposals', async () => {
      const res = await request(app).post('/api/v1/proposals').send({
        title: 'Cyberpunk Proposal',
        coverMessage: 'I will create stunning renders.'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('3. Reject unauthenticated GET /api/v1/projects/mine', async () => {
      const res = await request(app).get('/api/v1/projects/mine');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('4. Reject unauthenticated GET /api/v1/conversations', async () => {
      const res = await request(app).get('/api/v1/conversations');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('5. Reject unauthenticated GET /api/v1/notifications', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('End-to-End Marketplace Hiring & Escrow Flow (If DB Active)', () => {
    let brandToken = '';
    let creatorToken = '';
    let briefId = '';
    let proposalId = '';
    let projectId = '';
    let milestoneId = '';

    const testBrand = {
      email: `brand_p5_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Zenith Brand Labs',
      role: 'brand' as const
    };

    const testCreator = {
      email: `creator_p5_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Aetheria AI Director',
      role: 'creator' as const
    };

    it('6. Setup Brand and Creator test accounts with onboarded profiles', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const brandRes = await request(app).post('/api/v1/auth/signup').send(testBrand);
      expect(brandRes.status).toBe(201);
      brandToken = brandRes.body.data.token;

      const creatorRes = await request(app).post('/api/v1/auth/signup').send(testCreator);
      expect(creatorRes.status).toBe(201);
      creatorToken = creatorRes.body.data.token;

      // Onboard Brand profile
      await request(app)
        .patch('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({ companyName: 'Zenith Brand Labs', industry: 'Commercial & Advertising' });

      // Onboard Creator profile
      await request(app)
        .patch('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ name: 'Aetheria AI Director', handle: `aetheria_${Date.now()}`, specialtyCategory: 'Commercial & Advertising', aiTools: ['Midjourney', 'Runway Gen-3'] });
    });

    it('7. Brand creates and publishes a campaign brief', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const createRes = await request(app)
        .post('/api/v1/briefs')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          title: 'Zenith AI Commercial Spot',
          summary: 'High energy 3D visual for new electric vehicle.',
          category: 'Commercial & Advertising',
          budget: { amount: 200000, currency: 'INR' },
          deliverables: [{ description: '30s CGI Teaser', mediaType: 'video', quantity: 1 }]
        });

      expect(createRes.status).toBe(201);
      briefId = createRes.body.data.brief._id;

      // Publish brief
      const pubRes = await request(app)
        .post(`/api/v1/briefs/${briefId}/publish`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(pubRes.status).toBe(200);
      expect(pubRes.body.data.brief.status).toBe('published');
    });

    it('8. Creator discovers published brief and calculates explainable match score', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const matchRes = await request(app)
        .get('/api/v1/matching/me')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(matchRes.status).toBe(200);
      expect(matchRes.body.success).toBe(true);
      expect(Array.isArray(matchRes.body.data.matches)).toBe(true);
    });

    it('9. Reject Brand submitting a creator proposal (Role restriction)', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const res = await request(app)
        .post('/api/v1/proposals')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          briefId,
          coverMessage: 'Brand trying to propose',
          proposedBudget: 200000,
          proposedTimeline: '10 days'
        });

      expect(res.status).toBe(403);
    });

    it('10. Creator submits an official proposal', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const propRes = await request(app)
        .post('/api/v1/proposals')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          briefId,
          title: 'Zenith CGI Teaser Proposal',
          coverMessage: 'I specialize in Runway Gen-3 CGI animation.',
          proposedBudget: 200000,
          proposedTimeline: '10 days',
          deliverables: [{ description: '30s CGI Teaser', mediaType: 'video', quantity: 1 }],
          milestones: [{ title: 'Final Render', amount: 200000, description: 'Complete 30s teaser' }]
        });

      expect(propRes.status).toBe(201);
      expect(propRes.body.success).toBe(true);
      proposalId = propRes.body.data.proposal._id;
    });

    it('11. Brand reviews and accepts proposal, creating a Project and Conversation', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const acceptRes = await request(app)
        .post(`/api/v1/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.success).toBe(true);
      expect(acceptRes.body.data.project).toHaveProperty('_id');
      projectId = acceptRes.body.data.project._id;
      milestoneId = acceptRes.body.data.project.milestones[0]._id;
    });

    it('12. Brand funds project milestone via simulated escrow ledger', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const fundRes = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/fund`)
        .set('Authorization', `Bearer ${brandToken}`)
        .send({ amount: 200000, currency: 'INR' });

      expect(fundRes.status).toBe(200);
      expect(fundRes.body.success).toBe(true);
      expect(fundRes.body.data.ledgerEntry.isSimulation).toBe(true);
    });

    it('13. Creator submits milestone work', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const submitRes = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/submit`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          submissionNotes: 'Rendered in 4K resolution using ComfyUI & Gen-3.',
          submissionMediaUrl: 'https://example.com/render.mp4'
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.project.milestones[0].status).toBe('submitted');
    });

    it('14. Brand approves milestone work', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const approveRes = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/review`)
        .set('Authorization', `Bearer ${brandToken}`)
        .send({ action: 'approve', reviewNotes: 'Outstanding visual quality!' });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.success).toBe(true);
      expect(approveRes.body.data.project.milestones[0].status).toBe('approved');
    });

    it('15. Brand releases milestone funds, completing project', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const releaseRes = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${milestoneId}/release`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(releaseRes.status).toBe(200);
      expect(releaseRes.body.success).toBe(true);
      expect(releaseRes.body.data.project.status).toBe('completed');
    });

    it('16. Project participants can exchange messages in project chat', async () => {
      if (mongoose.connection.readyState !== 1) return;

      // Get conversation
      const convRes = await request(app)
        .get(`/api/v1/conversations/project/${projectId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(convRes.status).toBe(200);
      const convId = convRes.body.data.conversation._id;

      // Send message
      const msgRes = await request(app)
        .post(`/api/v1/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ text: 'Thank you for approving the final deliverables!' });

      expect(msgRes.status).toBe(201);
      expect(msgRes.body.success).toBe(true);
    });
  });
});
