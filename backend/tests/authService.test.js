const { hashPassword, comparePassword, hashToken, compareToken, signAccessToken, signRefreshToken, verifyToken } = require('../src/services/authService');
const config = require('../src/config');

describe('Auth Service', () => {
  it('hashes and verifies a password using argon2 or bcrypt fallback', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('signs and verifies JWT tokens', () => {
    const token = signAccessToken('testId', 'admin');
    const payload = verifyToken(token);
    expect(payload.id).toBe('testId');
    expect(payload.role).toBe('admin');
  });

  it('hashes and compares refresh tokens', async () => {
    const refreshToken = 'refresh-token-example';
    const hash = await hashToken(refreshToken);
    const valid = await compareToken(refreshToken, hash);
    expect(valid).toBe(true);
  });
});
