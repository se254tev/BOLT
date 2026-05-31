const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');
const logger = require('../services/logger');
const { isAccessTokenRevoked } = require('../core/redis/tokenStore');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: missing authorization header', {
      requestId: req.requestId,
      ip: req.ip,
    });
    return res.status(401).json({ success: false, message: 'Authentication required', code: 'authentication_required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    if (payload.type !== 'access') {
      logger.warn('Authentication failed: invalid token type', {
        requestId: req.requestId,
        ip: req.ip,
      });
      return res.status(401).json({ success: false, message: 'Invalid access token', code: 'invalid_token' });
    }

    if (await isAccessTokenRevoked(payload.jti)) {
      logger.warn('Authentication failed: revoked token', {
        requestId: req.requestId,
        tokenId: payload.jti,
        ip: req.ip,
      });
      return res.status(401).json({ success: false, message: 'Revoked access token', code: 'token_revoked' });
    }

    const user = await User.findById(payload.id).select('-password');

    if (!user || user.suspended || user.accountStatus !== 'active') {
      logger.warn('Authentication failed: disabled account or missing user', {
        requestId: req.requestId,
        userId: payload.id,
        ip: req.ip,
      });
      return res.status(403).json({ success: false, message: 'Account disabled', code: 'account_disabled' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      logger.warn('Authentication failed: token version mismatch', {
        requestId: req.requestId,
        userId: payload.id,
        ip: req.ip,
      });
      return res.status(401).json({ success: false, message: 'Session expired', code: 'session_expired' });
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
    return res.status(401).json({ success: false, message: 'Session invalid or expired', code: 'invalid_session' });
  }
};

module.exports = authenticate;
