const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');
const logger = require('../services/logger');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const createLimiter = ({ windowMs, max, errorCode = ERRORS.RATE_LIMIT_EXCEEDED }) => {
  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.originalUrl,
        windowMs,
        max,
        requestId: req.requestId,
      });
      const error = createError(errorCode);
      errorResponse(res, error);
    },
  };

  if (redisClient) {
    options.store = new RedisStore({ client: redisClient, passIfNotConnected: true });
  }

  return rateLimit(options);
};

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  errorCode: ERRORS.LOGIN_RATE_LIMIT_EXCEEDED,
});

const generalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  errorCode: ERRORS.RATE_LIMIT_EXCEEDED,
});

const sellerLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 200,
  errorCode: ERRORS.SELLER_RATE_LIMIT_EXCEEDED,
});

const adminLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 500,
  errorCode: ERRORS.ADMIN_RATE_LIMIT_EXCEEDED,
});

const adminAuthLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  errorCode: ERRORS.ADMIN_AUTH_RATE_LIMIT_EXCEEDED,
});

module.exports = { authLimiter, generalLimiter, sellerLimiter, adminLimiter, adminAuthLimiter };
