const crypto = require('crypto');
const User = require('../models/user');
const {
  signAccessToken,
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

const createTokens = async (user) => {
  const { token: accessToken, jti: accessJti } = signAccessToken(user.id, user.role, user.tokenVersion);
  const { token: refreshToken, jti: refreshJti } = signRefreshToken(user.id, user.role, user.tokenVersion);
  return { accessToken, accessJti, refreshToken, refreshJti };
};

const register = async (req, res) => {
  const { name, email, password, phone, role } = req.validated;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered', code: 'email_in_use' });
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role,
    emailVerified: false,
    accountStatus: 'active',
  });

  const verificationToken = crypto.randomBytes(24).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24;
  await user.save();

  const { accessToken, refreshToken, refreshJti } = await createTokens(user);
  await storeRefreshSession(user.id, refreshToken, refreshJti);

  res.cookie(config.cookieName, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  const responseUser = await User.findById(user.id).select('-password');
  return res.status(201).json({ success: true, data: { accessToken, user: responseUser }, message: 'Registration successful', code: 'registration_success' });
};

const login = async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email });

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'invalid_credentials' });
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    return res.status(403).json({ success: false, message: 'Admin users must sign in through the admin auth endpoint', code: 'admin_auth_required' });
  }

  if (user.suspended || user.accountStatus !== 'active') {
    return res.status(403).json({ success: false, message: 'Account disabled', code: 'account_disabled' });
  }

  const { accessToken, refreshToken, refreshJti } = await createTokens(user);
  await storeRefreshSession(user.id, refreshToken, refreshJti);

  res.cookie(config.cookieName, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  const responseUser = await User.findById(user.id).select('-password');
  res.json({ success: true, data: { accessToken, user: responseUser }, message: 'Login successful', code: 'login_success' });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.[config.cookieName];

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

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Session expired', code: 'session_expired' });
    }

    const isValid = await validateRefreshSession(user.id, payload.jti, refreshToken);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired', code: 'invalid_refresh_session' });
    }

    const { accessToken, refreshToken: newRefreshToken, refreshJti } = await createTokens(user);
    await rotateRefreshSession(payload.jti, refreshJti, user.id, newRefreshToken);

    res.cookie(config.cookieName, newRefreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ success: true, data: { accessToken }, message: 'Token refreshed', code: 'refresh_success' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token', code: 'invalid_refresh_token' });
  }
};

const logout = async (req, res) => {
  let tokenVersionUpdated = false;
  const refreshToken = req.cookies?.[config.cookieName];

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
      if (payload.type === 'access') {
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

  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: '/',
  });

  res.json({ success: true, message: 'Logged out', code: 'logout_success' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.validated;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(204).json({ success: true, message: 'If your email exists, you will receive a password reset link shortly.', code: 'password_reset_initiated' });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 1000 * 60 * 60;
  await user.save();

  res.json({ success: true, message: 'If your email exists, you will receive a password reset link shortly.', code: 'password_reset_initiated' });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.validated;
  const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token', code: 'invalid_reset_token' });
  }

  user.password = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully', code: 'password_reset_success' });
};

const verifyEmail = async (req, res) => {
  const { token } = req.validated;
  const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token', code: 'invalid_verification_token' });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully', code: 'verification_success' });
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail };
