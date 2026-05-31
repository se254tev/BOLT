const request = require('supertest');
const express = require('express');
const healthRoutes = require('../src/routes/health');

const app = express();
app.use('/api', healthRoutes);

describe('Health endpoints', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns readiness status', async () => {
    const response = await request(app).get('/api/ready');
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('ready');
  });
});
