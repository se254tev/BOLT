const redisClient = require('../config/redis');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const tierLimits = {
  guest: { window: 60, limit: 30 },
  buyer: { window: 60, limit: 120 },
  seller: { window: 60, limit: 300 },
  admin: { window: 60, limit: 600 },
};

const throttle = async (req, res, next) => {
  if (!redisClient) return next();
  const tier = req.user?.role || 'guest';
  const key = `throttle:${tier}:${req.ip}`;
  const { window, limit } = tierLimits[tier] || tierLimits.guest;
  const current = await redisClient.incr(key);
  if (current === 1) {
    await redisClient.expire(key, window);
  }
  if (current > limit) {
    const error = createError(ERRORS.RATE_LIMIT_EXCEEDED);
    return errorResponse(res, error);
  }
  next();
};

module.exports = throttle;
