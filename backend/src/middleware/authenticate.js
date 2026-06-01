const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');
const logger = require('../services/logger');
const { isAccessTokenRevoked } = require('../core/redis/tokenStore');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  // Allow admin auth endpoints and preflight through without authentication
  if (req.originalUrl && (req.originalUrl.startsWith('/api/admin/auth/login') || req.originalUrl.startsWith('/api/admin/auth/register'))) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: missing authorization header', {
      requestId: req.requestId,
      ip: req.ip,
    });
    const error = createError(ERRORS.AUTHENTICATION_REQUIRED);
    return errorResponse(res, error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    if (payload.type !== 'access') {
      logger.warn('Authentication failed: invalid token type', {
        requestId: req.requestId,
        ip: req.ip,
      });
      const error = createError(ERRORS.INVALID_TOKEN);
      return errorResponse(res, error);
    }

    if (await isAccessTokenRevoked(payload.jti)) {
      logger.warn('Authentication failed: revoked token', {
        requestId: req.requestId,
        tokenId: payload.jti,
        ip: req.ip,
      });
      const error = createError(ERRORS.TOKEN_REVOKED);
      return errorResponse(res, error);
    }

    const user = await User.findById(payload.id).select('-password');

    if (!user || user.suspended || user.accountStatus !== 'active') {
      logger.warn('Authentication failed: disabled account or missing user', {
        requestId: req.requestId,
        userId: payload.id,
        ip: req.ip,
      });
      const error = createError(ERRORS.ACCOUNT_DISABLED);
      return errorResponse(res, error);
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      logger.warn('Authentication failed: token version mismatch', {
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
    logger.warn('Authentication failed: invalid token', {
      requestId: req.requestId,
      ip: req.ip,
      reason: err.message,
    });
    const error = createError(ERRORS.SESSION_EXPIRED);
    return errorResponse(res, error);
  }
};

module.exports = authenticate;
