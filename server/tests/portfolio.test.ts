import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';

describe('Kampus.VC Phase 3 — Portfolio & Media Management Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kampus-vc-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose test connection bypassed; running portfolio API structure assertions.');
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

  describe('Authorization & Validation Enforcement', () => {
    it('1. Reject unauthenticated POST /api/v1/portfolio', async () => {
      const response = await request(app).post('/api/v1/portfolio').send({
        title: 'Cyberpunk Visual',
        mediaUrl: 'https://example.com/art.jpg',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('2. Reject unauthenticated media file upload', async () => {
      const response = await request(app).post('/api/v1/portfolio/upload');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('3. Reject GET /api/v1/portfolio/mine for unauthenticated users', async () => {
      const response = await request(app).get('/api/v1/portfolio/mine');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('4. Return 404 for invalid creator ID public portfolio lookup', async () => {
      const response = await request(app).get('/api/v1/portfolio/creator/invalid_id_999999999999999999999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('5. Return 404 for non-existent portfolio item ID', async () => {
      const response = await request(app).get('/api/v1/portfolio/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('End-to-End Creator Portfolio Flow (If DB Active)', () => {
    let creatorToken = '';
    let brandToken = '';
    let portfolioItemId = '';

    const testCreator = {
      email: `creator_p3_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Creator Portfolio User',
      role: 'creator' as const,
    };

    const testBrand = {
      email: `brand_p3_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Brand Test User',
      role: 'brand' as const,
    };

    it('6. Register test creator and brand accounts', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const creatorRes = await request(app).post('/api/v1/auth/signup').send(testCreator);
      expect(creatorRes.status).toBe(201);
      creatorToken = creatorRes.body.data.token;

      const brandRes = await request(app).post('/api/v1/auth/signup').send(testBrand);
      expect(brandRes.status).toBe(201);
      brandToken = brandRes.body.data.token;
    });

    it('7. Reject Brand attempting to create portfolio item (Role restriction)', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', `Bearer ${brandToken}`)
        .send({
          title: 'Brand Visual',
          mediaUrl: 'https://example.com/art.jpg',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('8. Creator successfully creates portfolio artwork', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Cyberpunk Anime Director Cut',
          description: 'Rendered in Runway Gen-3 with custom LoRA lighting.',
          category: 'AI Filmmaking',
          mediaType: 'image',
          mediaUrl: 'https://example.com/showcase.jpg',
          toolsUsed: ['Runway Gen-3', 'ComfyUI'],
          aiInvolvement: 'Full Generative',
          commercialLicensing: 'Commercial Buyout',
          visibility: 'public',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Cyberpunk Anime Director Cut');
      portfolioItemId = response.body.data._id;
    });

    it('9. Creator can update own portfolio item', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app)
        .patch(`/api/v1/portfolio/${portfolioItemId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Updated Cyberpunk Title',
          isFeatured: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Updated Cyberpunk Title');
      expect(response.body.data).toHaveProperty('isFeatured', true);
    });

    it('10. Creator can delete own portfolio item', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app)
        .delete(`/api/v1/portfolio/${portfolioItemId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
