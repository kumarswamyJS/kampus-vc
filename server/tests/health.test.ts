import request from 'supertest';
import { app } from '../src/app';

describe('GET /api/health', () => {
  it('should return 200 OK with server and database status information', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'Kampus.VC API Backend');
    expect(response.body.server).toHaveProperty('status', 'online');
    expect(response.body).toHaveProperty('database');
    expect(typeof response.body.database.connected).toBe('boolean');
    expect(typeof response.body.database.status).toBe('string');
  });

  it('should return 404 for nonexistent API routes', async () => {
    const response = await request(app).get('/api/nonexistent-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
