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
const ERRORS = require('../constants/errorCodes');
const { createError, AppError } = require('../utils/appError');
const { successResponse, createdResponse, errorResponse } = require('../utils/apiResponse');

const createTokens = async (user) => {
  const { token: accessToken, jti: accessJti } = signAccessToken(user.id, user.role, user.tokenVersion);
  const { token: refreshToken, jti: refreshJti } = signRefreshToken(user.id, user.role, user.tokenVersion);
  return { accessToken, accessJti, refreshToken, refreshJti };
};

const register = async (req, res) => {
  const { name, email, password, phone, role } = req.validated;
  const existing = await User.findOne({ email });
  if (existing) {
    const error = createError(ERRORS.EMAIL_ALREADY_REGISTERED);
    return errorResponse(res, error);
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
  return createdResponse(res, { accessToken, user: responseUser }, 'Registration successful');
};

const login = async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email });

  if (!user || !(await comparePassword(password, user.password))) {
    const error = createError(ERRORS.INVALID_CREDENTIALS);
    return errorResponse(res, error);
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    const error = createError(ERRORS.ADMIN_AUTH_REQUIRED);
    return errorResponse(res, error);
  }

  if (user.suspended || user.accountStatus !== 'active') {
    const error = createError(ERRORS.ACCOUNT_DISABLED);
    return errorResponse(res, error);
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
  successResponse(res, { accessToken, user: responseUser }, 'Login successful');
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.[config.cookieName];

  if (!refreshToken) {
    const error = createError(ERRORS.REFRESH_TOKEN_REQUIRED);
    return errorResponse(res, error);
  }

  try {
    const payload = verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      const error = createError(ERRORS.INVALID_REFRESH_TOKEN);
      return errorResponse(res, error);
    }

    const user = await User.findById(payload.id).select('-password');
    if (!user || user.suspended || user.accountStatus !== 'active') {
      const error = createError(ERRORS.ACCOUNT_DISABLED);
      return errorResponse(res, error);
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      const error = createError(ERRORS.SESSION_EXPIRED);
      return errorResponse(res, error);
    }

    const isValid = await validateRefreshSession(user.id, payload.jti, refreshToken);
    if (!isValid) {
      const error = createError(ERRORS.INVALID_REFRESH_TOKEN);
      return errorResponse(res, error);
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

    successResponse(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    const error = createError(ERRORS.INVALID_REFRESH_TOKEN);
    return errorResponse(res, error);
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

  successResponse(res, null, 'Logged out');
};

const forgotPassword = async (req, res) => {
  const { email } = req.validated;
  const user = await User.findOne({ email });

  if (!user) {
    return successResponse(res, null, 'If your email exists, you will receive a password reset link shortly.', 204);
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 1000 * 60 * 60;
  await user.save();

  successResponse(res, null, 'If your email exists, you will receive a password reset link shortly.');
};

const resetPassword = async (req, res) => {
  const { token, password } = req.validated;
  const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    const error = createError(ERRORS.INVALID_RESET_TOKEN);
    return errorResponse(res, error);
  }

  user.password = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  successResponse(res, null, 'Password reset successfully');
};

const verifyEmail = async (req, res) => {
  const { token } = req.validated;
  const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } });

  if (!user) {
    const error = createError(ERRORS.INVALID_VERIFICATION_TOKEN);
    return errorResponse(res, error);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  successResponse(res, null, 'Email verified successfully');
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail };
