const validateRequest = require('../src/middleware/validate');
const schema = require('../src/schemas/auth').loginSchema;

describe('Request validation middleware', () => {
  it('rejects invalid login payloads', () => {
    const req = { body: { email: 'not-an-email', password: 'short' }, query: {}, params: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    validateRequest(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid login payloads', () => {
    const req = { body: { email: 'admin@boltmarket.com', password: 'ValidPass123' }, query: {}, params: {} };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    validateRequest(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.validated).toEqual(req.body);
  });
});
