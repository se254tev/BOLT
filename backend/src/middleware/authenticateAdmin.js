const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');
const logger = require('../services/logger');
const { isAccessTokenRevoked } = require('../core/redis/tokenStore');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const authenticateAdmin = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  // Allow public admin auth endpoints through without admin authentication
  if (req.originalUrl && (req.originalUrl.startsWith('/api/admin/auth/login') || req.originalUrl.startsWith('/api/admin/auth/register'))) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Admin authentication failed: missing authorization header', {
      requestId: req.requestId,
      ip: req.ip,
    });
    const error = createError(ERRORS.AUTHENTICATION_REQUIRED);
    return errorResponse(res, error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    if (payload.type !== 'admin') {
      logger.warn('Admin authentication failed: invalid token type', {
        requestId: req.requestId,
        ip: req.ip,
      });
      const error = createError(ERRORS.INVALID_TOKEN);
      return errorResponse(res, error);
    }

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      logger.warn('Admin authentication failed: wrong role', {
        requestId: req.requestId,
        ip: req.ip,
        role: payload.role,
      });
      const error = createError(ERRORS.INSUFFICIENT_PRIVILEGES);
      return errorResponse(res, error);
    }

    if (await isAccessTokenRevoked(payload.jti)) {
      logger.warn('Admin authentication failed: revoked token', {
        requestId: req.requestId,
        tokenId: payload.jti,
        ip: req.ip,
      });
      const error = createError(ERRORS.TOKEN_REVOKED);
      return errorResponse(res, error);
    }

    const user = await User.findById(payload.id).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -mfaSecret');
    if (!user || user.suspended || user.accountStatus !== 'active') {
      logger.warn('Admin authentication failed: disabled account or missing user', {
        requestId: req.requestId,
        userId: payload.id,
        ip: req.ip,
      });
      const error = createError(ERRORS.ACCOUNT_DISABLED);
      return errorResponse(res, error);
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      logger.warn('Admin authentication failed: token version mismatch', {
        requestId: req.requestId,
        userId: payload.id,
        ip: req.ip,
      });
      const error = createError(ERRORS.SESSION_EXPIRED);
      return errorResponse(res, error);
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (err) {
    logger.warn('Admin authentication failed: invalid token', {
      requestId: req.requestId,
      ip: req.ip,
      reason: err.message,
    });
    const error = createError(ERRORS.SESSION_EXPIRED);
    return errorResponse(res, error);
  }
};

module.exports = authenticateAdmin;
