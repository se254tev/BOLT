const { applySeller, activateSeller } = require('../src/controllers/sellerController');

jest.mock('../src/models/user');
jest.mock('../src/models/auditLog');

const User = require('../src/models/user');
const AuditLog = require('../src/models/auditLog');

function makeRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json };
}

describe('sellerController', () => {
  beforeEach(() => jest.resetAllMocks());

  test('applySeller returns 401 when unauthenticated', async () => {
    const req = { user: null };
    const res = makeRes();
    await applySeller(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('applySeller returns 400 when role not buyer', async () => {
    const req = { user: { id: '1', role: 'seller' } };
    const res = makeRes();
    await applySeller(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('applySeller sets status to pending', async () => {
    const mockUserDoc = { id: '1', sellerStatus: 'none', save: jest.fn() };
    User.findById = jest.fn().mockResolvedValue(mockUserDoc);
    AuditLog.create = jest.fn().mockResolvedValue({});

    const req = {
      user: { id: '1', role: 'buyer' },
      body: { businessName: 'My Shop', businessPhone: '0700000000', businessAddress: 'Nairobi' },
    };
    const res = { json: jest.fn(), status: jest.fn(() => ({ json: jest.fn() })) };
    await applySeller(req, res);
    expect(mockUserDoc.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ sellerStatus: 'pending' });
  });

  test('applySeller allows buyers to resubmit after rejection', async () => {
    const mockUserDoc = { id: '2', sellerStatus: 'rejected', save: jest.fn() };
    User.findById = jest.fn().mockResolvedValue(mockUserDoc);
    AuditLog.create = jest.fn().mockResolvedValue({});

    const req = { user: { id: '2', role: 'buyer' }, body: { businessName: 'Shop', businessPhone: '0700000000', businessAddress: 'Nairobi' } };
    const res = { json: jest.fn(), status: jest.fn(() => ({ json: jest.fn() })) };

    await applySeller(req, res);

    expect(mockUserDoc.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ sellerStatus: 'pending' });
  });

  test('activateSeller returns 401 when unauthenticated', async () => {
    const req = { user: null };
    const res = makeRes();
    await activateSeller(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('activateSeller returns 404 when user not found', async () => {
    User.findById = jest.fn().mockResolvedValue(null);
    const req = { user: { id: '2' } };
    const res = makeRes();
    await activateSeller(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('activateSeller returns 400 when not approved', async () => {
    const mockUserDoc = { id: '3', sellerStatus: 'pending', save: jest.fn() };
    User.findById = jest.fn().mockResolvedValue(mockUserDoc);
    const req = { user: { id: '3' } };
    const res = makeRes();
    await activateSeller(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('activateSeller sets role and status when approved', async () => {
    const mockUserDoc = { id: '4', sellerStatus: 'approved', save: jest.fn() };
    User.findById = jest.fn().mockResolvedValue(mockUserDoc);
    AuditLog.create = jest.fn().mockResolvedValue({});
    const req = { user: { id: '4' } };
    const res = { json: jest.fn(), status: jest.fn(() => ({ json: jest.fn() })) };
    await activateSeller(req, res);
    expect(mockUserDoc.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ role: 'seller', sellerStatus: 'active' });
  });
});
