const request = require('supertest');
const express = require('express');
const { generalLimiter } = require('../src/middleware/rateLimit');

const app = express();
app.get('/test', generalLimiter, (req, res) => res.json({ ok: true }));

describe('Rate limiting', () => {
  it('allows requests under the limit', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
  });
});
