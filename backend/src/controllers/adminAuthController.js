const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const otplib = require('otplib');
const User = require('../models/user');
const AdminSession = require('../models/adminSession');
const AuditLog = require('../models/auditLog');
const {
  signAdminToken,
  signRefreshToken,
  hashPassword,
  comparePassword,
  verifyToken,
  storeRefreshSession,
  validateRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  blacklistAccessToken,
} = require('../services/authService');
const config = require('../config');

const createAdminTokens = async (user) => {
  const { token: accessToken, jti: accessJti } = signAdminToken(user.id, user.role, user.tokenVersion, user.permissions);
  const { token: refreshToken, jti: refreshJti } = signRefreshToken(user.id, user.role, user.tokenVersion);
  return { accessToken, accessJti, refreshToken, refreshJti };
};

const login = async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'invalid_credentials' });
  }

  if (user.lockedUntil && new Date() < user.lockedUntil) {
    return res.status(403).json({ success: false, message: 'Account locked due to multiple failed login attempts', code: 'account_locked' });
  }

  const passwordValid = await comparePassword(password, user.password);
  if (!passwordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'invalid_credentials' });
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Admin access only', code: 'admin_access_required' });
  }

  if (user.suspended || user.accountStatus !== 'active') {
    return res.status(403).json({ success: false, message: 'Account disabled', code: 'account_disabled' });
  }

  // MFA enforcement
  if (user.mfaEnabled) {
    const mfaToken = req.validated.mfaToken || req.body.mfaToken;
    if (!mfaToken) {
      return res.status(428).json({ success: false, message: 'MFA token required', code: 'mfa_required' });
    }
    const secret = user.mfaSecret;
    const ok = otplib.authenticator.check(mfaToken, secret);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid MFA token', code: 'invalid_mfa' });
  }

  // Reset lockout
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  const { accessToken, refreshToken, refreshJti } = await createAdminTokens(user);
  await storeRefreshSession(user.id, refreshToken, refreshJti);

  // create AdminSession with hashed refresh token
  const ttlSeconds = Math.floor(30 * 24 * 60 * 60);
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  const session = await AdminSession.create({
    adminId: user.id,
    jti: refreshJti,
    refreshTokenHash: refreshHash,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    deviceName: req.body.deviceName || req.get('User-Agent'),
    createdAt: new Date(),
    lastSeenAt: new Date(),
    expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    isRevoked: false,
  });

  res.cookie(config.adminCookieName, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: ttlSeconds * 1000,
    path: '/api/admin',
  });

  await AuditLog.create({ adminId: user.id, action: 'ADMIN_LOGIN', resource: 'admin', resourceId: user.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  const responseUser = await User.findById(user.id).select('-password');
  res.json({ success: true, data: { accessToken, admin: responseUser }, message: 'Admin login successful', code: 'admin_login_success' });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.[config.adminCookieName];

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required', code: 'refresh_required' });
  }

  try {
    const payload = verifyToken(refreshToken);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token', code: 'invalid_refresh_token' });
    }

    const user = await User.findById(payload.id).select('-password');
    if (!user || user.suspended || user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: 'Account disabled', code: 'account_disabled' });
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Admin access only', code: 'admin_access_required' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Session expired', code: 'session_expired' });
    }

    const isValid = await validateRefreshSession(user.id, payload.jti, refreshToken);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired', code: 'invalid_refresh_session' });
    }

    const { accessToken, refreshToken: newRefreshToken, refreshJti } = await createAdminTokens(user);
    await rotateRefreshSession(payload.jti, refreshJti, user.id, newRefreshToken);

    // mark old session revoked and create new session record
    await AdminSession.findOneAndUpdate({ jti: payload.jti, adminId: user.id }, { isRevoked: true, lastSeenAt: new Date() });
    const ttlSeconds = Math.floor(30 * 24 * 60 * 60);
    const refreshHash = await bcrypt.hash(newRefreshToken, 10);
    await AdminSession.create({
      adminId: user.id,
      jti: refreshJti,
      refreshTokenHash: refreshHash,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceName: req.body.deviceName || req.get('User-Agent'),
      createdAt: new Date(),
      lastSeenAt: new Date(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      isRevoked: false,
    });

    res.cookie(config.adminCookieName, newRefreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: ttlSeconds * 1000,
      path: '/api/admin',
    });

    await AuditLog.create({ adminId: user.id, action: 'ADMIN_REFRESH', resource: 'admin', resourceId: user.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });

    res.json({ success: true, data: { accessToken }, message: 'Admin token refreshed', code: 'admin_refresh_success' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token', code: 'invalid_refresh_token' });
  }
};

const logout = async (req, res) => {
  let tokenVersionUpdated = false;
  const refreshToken = req.cookies?.[config.adminCookieName];

    if (refreshToken) {
    try {
      const payload = verifyToken(refreshToken);
      if (payload.type === 'refresh') {
        await revokeRefreshSession(payload.jti);
        const user = await User.findById(payload.id);
        if (user) {
          user.tokenVersion += 1;
          await user.save();
          tokenVersionUpdated = true;
        }
        // mark session revoked in DB
        await AdminSession.findOneAndUpdate({ jti: payload.jti, adminId: payload.id }, { isRevoked: true });
      }
    } catch (err) {
      // ignore invalid refresh payload
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(accessToken);
      if (payload.type === 'admin') {
        await blacklistAccessToken(payload.jti, payload.exp);
      }
      if (!tokenVersionUpdated) {
        const user = await User.findById(payload.id);
        if (user) {
          user.tokenVersion += 1;
          await user.save();
        }
      }
    } catch (err) {
      // ignore invalid access payload
    }
  }

  await AuditLog.create({ adminId: req.user?.id || null, action: 'ADMIN_LOGOUT', resource: 'admin', resourceId: req.user?.id || null, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.clearCookie(config.adminCookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: '/api/admin',
  });

  res.json({ success: true, message: 'Admin logged out', code: 'admin_logout_success' });
};

const listSessions = async (req, res) => {
  const sessions = await AdminSession.find({ adminId: req.user.id }).select('-refreshTokenHash').sort({ lastSeenAt: -1 });
  res.json({ success: true, data: { sessions } });
};

const revokeSession = async (req, res) => {
  const id = req.params.id;
  const session = await AdminSession.findOne({ _id: id, adminId: req.user.id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  session.isRevoked = true;
  await session.save();
  await revokeRefreshSession(session.jti);
  await AuditLog.create({ adminId: req.user.id, action: 'ADMIN_SESSION_REVOKED', resource: 'adminSession', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ success: true, message: 'Session revoked' });
};

const revokeAllSessions = async (req, res) => {
  const sessions = await AdminSession.find({ adminId: req.user.id, isRevoked: false });
  for (const s of sessions) {
    s.isRevoked = true;
    await revokeRefreshSession(s.jti);
    await s.save();
  }
  await AuditLog.create({ adminId: req.user.id, action: 'ADMIN_REVOKE_ALL_SESSIONS', resource: 'adminSession', resourceId: null, ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ success: true, message: 'All sessions revoked' });
};

module.exports = { login, refresh, logout, listSessions, revokeSession, revokeAllSessions };
