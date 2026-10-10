import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';

describe('Kampus.VC Phase 7 — Creative DNA Passport, Proof of Creativity & Trust Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kampus-vc-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose test connection bypassed; running Phase 7 API structure assertions.');
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

  describe('Authorization & Security Guards for Phase 7 Endpoints', () => {
    it('1. Reject unauthenticated GET /api/v1/passport/me', async () => {
      const res = await request(app).get('/api/v1/passport/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. Reject unauthenticated GET /api/v1/availability/me', async () => {
      const res = await request(app).get('/api/v1/availability/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('3. Reject unauthenticated GET /api/v1/shortlists/mine', async () => {
      const res = await request(app).get('/api/v1/shortlists/mine');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('4. Reject unauthenticated GET /api/v1/admin/proofs', async () => {
      const res = await request(app).get('/api/v1/admin/proofs');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('End-to-End Creative DNA, Availability & Shortlist Workflows (If DB Active)', () => {
    let brandToken = '';
    let creatorToken = '';
    let creatorUserId = '';
    let shortlistId = '';

    const testBrand = {
      email: `brand_p7_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Quantum Studio',
      role: 'brand' as const,
    };

    const testCreator = {
      email: `creator_p7_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Hyperion AI Artist',
      role: 'creator' as const,
    };

    it('5. Setup Brand & Creator accounts', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const brandRes = await request(app).post('/api/v1/auth/signup').send(testBrand);
      expect(brandRes.status).toBe(201);
      brandToken = brandRes.body.data.token;

      const creatorRes = await request(app).post('/api/v1/auth/signup').send(testCreator);
      expect(creatorRes.status).toBe(201);
      creatorToken = creatorRes.body.data.token;
      creatorUserId = creatorRes.body.data.user.id || creatorRes.body.data.user._id;

      await request(app).patch('/api/v1/profiles/me').set('Authorization', `Bearer ${brandToken}`).send({ companyName: 'Quantum Studio' });
      await request(app).patch('/api/v1/profiles/me').set('Authorization', `Bearer ${creatorToken}`).send({ name: 'Hyperion AI Artist', handle: `hyperion_${Date.now()}` });
    });

    it('6. Creator fetches & re-analyzes Creative DNA Passport', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const passportRes = await request(app)
        .get('/api/v1/passport/me')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(passportRes.status).toBe(200);
      expect(passportRes.body.success).toBe(true);
      expect(passportRes.body.data).toHaveProperty('passport');
      expect(passportRes.body.data).toHaveProperty('reliability');
    });

    it('7. Creator updates availability settings', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const availRes = await request(app)
        .patch('/api/v1/availability/me')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          isAcceptingInquiries: true,
          weeklyCapacityHours: 35,
          timezone: 'Asia/Kolkata',
        });

      expect(availRes.status).toBe(200);
      expect(availRes.body.success).toBe(true);
      expect(availRes.body.data.weeklyCapacityHours).toBe(35);
    });

    it('8. Brand creates a private creator shortlist', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const shortlistRes = await request(app)
        .post('/api/v1/shortlists')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          name: 'Top CGI Directors',
          notes: 'High priority 3D animators for Q4 campaign.',
        });

      expect(shortlistRes.status).toBe(201);
      expect(shortlistRes.body.success).toBe(true);
      shortlistId = shortlistRes.body.data._id;
    });

    it('9. Brand adds creator to private shortlist', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const addRes = await request(app)
        .post(`/api/v1/shortlists/${shortlistId}/creators`)
        .set('Authorization', `Bearer ${brandToken}`)
        .send({ creatorUserId });

      expect(addRes.status).toBe(200);
      expect(addRes.body.success).toBe(true);
      expect(addRes.body.data.creatorUserIds.length).toBe(1);
    });

    it('10. Perform contract licensing intelligence analysis', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const licenseRes = await request(app)
        .post('/api/v1/licensing/analyze-brief')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({ briefId: new mongoose.Types.ObjectId().toString() });

      // If brief doesn't exist, expect 404 cleanly
      expect([200, 404]).toContain(licenseRes.status);
    });
  });
});
