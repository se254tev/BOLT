const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');
const logger = require('../services/logger');

const createLimiter = ({ windowMs, max, message, code }) => {
  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.originalUrl,
        windowMs,
        max,
        requestId: req.requestId,
      });
      res.status(429).json({ success: false, message: 'Too many requests. Please try again later.', code: code || 'rate_limit_exceeded' });
    },
  };

  if (redisClient) {
    options.store = new RedisStore({ sendCommand: (...args) => redisClient.call(...args) });
  }

  return rateLimit(options);
};

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please wait 15 minutes.',
});

const generalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests. Please slow down.',
});

const sellerLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 200,
  message: 'Seller endpoint limit reached.',
});

const adminLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 500,
  message: 'Admin endpoint limit reached.',
});

const adminAuthLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many admin auth attempts. Try again later.',
  code: 'admin_auth_rate_limited',
});

module.exports = { authLimiter, generalLimiter, sellerLimiter, adminLimiter, adminAuthLimiter };
