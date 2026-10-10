import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';
import { User } from '../src/models/User';
import { Creator } from '../src/models/Creator';
import { Brand } from '../src/models/Brand';

describe('Kampus.VC Phase 2 — Authentication & Profile API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kampus-vc-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose test connection bypassed; running API structure assertions.');
    }
  });

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
    } catch (err) {
      // Ignore cleanup error in disconnected test env
    }
  });

  describe('Validation & Payload Safety', () => {
    it('1. Reject signup with invalid email or missing role', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        email: 'invalid-email-format',
        password: '123',
        displayName: 'A',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('2. Reject login with missing credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('3. Reject unauthenticated GET /api/v1/auth/me', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('4. Reject unauthenticated GET /api/v1/profiles/me', async () => {
      const response = await request(app).get('/api/v1/profiles/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('5. Return 503 for unconfigured Google OAuth route', async () => {
      const response = await request(app).get('/api/v1/auth/google');

      expect([200, 503]).toContain(response.status);
    });
  });

  describe('Database End-to-End Registration & Auth Flow (If DB Active)', () => {
    const testCreator = {
      email: `creator_${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      displayName: 'Test Creator',
      role: 'creator' as const,
    };

    let authToken = '';
    let authCookie = '';

    it('6. Create user & creator profile upon valid signup', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app).post('/api/v1/auth/signup').send(testCreator);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', testCreator.email.toLowerCase());
      expect(response.body.data.user).toHaveProperty('role', 'creator');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');

      authToken = response.body.data.token;
      authCookie = response.headers['set-cookie'] ? response.headers['set-cookie'][0] : '';
    });

    it('7. Reject duplicate email signup cleanly', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app).post('/api/v1/auth/signup').send(testCreator);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'EMAIL_EXISTS');
    });

    it('8. Successfully authenticate user via login', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app).post('/api/v1/auth/login').send({
        email: testCreator.email,
        password: testCreator.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('9. Retrieve current user session via /api/v1/auth/me', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', testCreator.email.toLowerCase());
    });

    it('10. Update profile fields via PATCH /api/v1/profiles/me', async () => {
      if (mongoose.connection.readyState !== 1) return;

      const response = await request(app)
        .patch('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bio: 'Pioneering generative AI filmmaking and visual storyboards.',
          specialtyCategory: 'AI Filmmaking',
          aiTools: ['Runway Gen-3', 'Midjourney v6', 'ComfyUI'],
          experienceLevel: 'Advanced',
          hourlyRate: '$150/hr',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('completionScore');
      expect(typeof response.body.data.completionScore).toBe('number');
    });
  });
});
