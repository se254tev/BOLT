const authorize = require('../src/middleware/authorize');

describe('Authorization middleware', () => {
  it('denies access when no user is present', () => {
    const middleware = authorize(['admin']);
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('denies access with insufficient role', () => {
    const middleware = authorize(['admin']);
    const req = { user: { role: 'buyer' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access for permitted roles', () => {
    const middleware = authorize(['admin', 'super_admin']);
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
