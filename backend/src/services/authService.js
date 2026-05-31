const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const tokenStore = require('../core/redis/tokenStore');

const signAccessToken = (userId, role, tokenVersion) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { id: userId, role, type: 'access', tokenVersion },
    config.jwtSecret,
    {
      expiresIn: config.jwtAccessExpiresIn,
      jwtid: jti,
    },
  );
  return { token, jti };
};

const buildPermissions = (role) => {
  if (role === 'super_admin') {
    return [
      'manage_users',
      'manage_products',
      'manage_orders',
      'view_analytics',
      'manage_platform',
    ];
  }
  if (role === 'admin') {
    return ['manage_products', 'manage_orders', 'view_analytics'];
  }
  return [];
};

const signAdminToken = (userId, role, tokenVersion, permissionsFromDb = null) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const permissions = Array.isArray(permissionsFromDb) ? permissionsFromDb : buildPermissions(role);
  const token = jwt.sign(
    { id: userId, role, type: 'admin', permissions, tokenVersion },
    config.jwtSecret,
    {
      expiresIn: config.jwtAccessExpiresIn,
      jwtid: jti,
    },
  );
  return { token, jti };
};

const signRefreshToken = (userId, role, tokenVersion) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { id: userId, role, type: 'refresh', tokenVersion },
    config.jwtSecret,
    {
      expiresIn: config.jwtRefreshExpiresIn,
      jwtid: jti,
    },
  );
  return { token, jti };
};

const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

const hashPassword = async (password) => {
  const argon2 = require('argon2');
  const bcrypt = require('bcryptjs');
  try {
    return await argon2.hash(password, { type: argon2.argon2id });
  } catch (err) {
    return bcrypt.hash(password, await bcrypt.genSalt(config.bcryptSaltRounds));
  }
};

const comparePassword = async (password, hash) => {
  const argon2 = require('argon2');
  const bcrypt = require('bcryptjs');
  if (hash.startsWith('$argon2')) {
    return argon2.verify(hash, password);
  }
  return bcrypt.compare(password, hash);
};

const storeRefreshSession = async (userId, refreshToken, refreshJti) => {
  const ttlSeconds = Math.floor(30 * 24 * 60 * 60);
  await tokenStore.storeRefreshToken(userId, refreshToken, refreshJti, ttlSeconds);
};

const validateRefreshSession = async (userId, refreshJti, refreshToken) => {
  return tokenStore.validateRefreshToken(userId, refreshJti, refreshToken);
};

const rotateRefreshSession = async (oldJti, newJti, userId, refreshToken) => {
  const ttlSeconds = Math.floor(30 * 24 * 60 * 60);
  await tokenStore.rotateRefreshToken(oldJti, newJti, userId, refreshToken, ttlSeconds);
};

const revokeRefreshSession = async (refreshJti) => tokenStore.revokeRefreshToken(refreshJti);

const blacklistAccessToken = async (accessJti, expiresAtSeconds) => tokenStore.revokeAccessToken(accessJti, expiresAtSeconds);

const isAccessTokenRevoked = async (jti) => tokenStore.isAccessTokenRevoked(jti);

module.exports = {
  signAccessToken,
  signAdminToken,
  signRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  storeRefreshSession,
  validateRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  blacklistAccessToken,
  isAccessTokenRevoked,
};
