const redisClient = require('../../config/redis');
const { hashToken, compareToken } = require('../../services/tokenUtils');

const accessTokenBlacklistKey = (jti) => `blacklist:access:${jti}`;
const refreshTokenKey = (jti) => `refresh_token:${jti}`;

const storeRefreshToken = async (userId, refreshToken, jti, ttlSeconds) => {
  if (!redisClient) {
    console.warn('Redis not configured — storeRefreshToken is a no-op');
    return;
  }
  const hashed = await hashToken(refreshToken);
  const payload = JSON.stringify({ userId, hash: hashed });
  await redisClient.set(refreshTokenKey(jti), payload, 'EX', ttlSeconds);
};

const validateRefreshToken = async (userId, jti, refreshToken) => {
  if (!redisClient) return false;
  const raw = await redisClient.get(refreshTokenKey(jti));
  if (!raw) {
    return false;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return false;
  }
  if (parsed.userId !== userId) {
    return false;
  }
  return compareToken(refreshToken, parsed.hash);
};

const rotateRefreshToken = async (oldJti, newJti, userId, refreshToken, ttlSeconds) => {
  if (!redisClient) {
    console.warn('Redis not configured — rotateRefreshToken is a no-op');
    return;
  }
  const hashed = await hashToken(refreshToken);
  const payload = JSON.stringify({ userId, hash: hashed });
  const pipeline = redisClient.multi();
  pipeline.del(refreshTokenKey(oldJti));
  pipeline.set(refreshTokenKey(newJti), payload, 'EX', ttlSeconds);
  await pipeline.exec();
};

const revokeRefreshToken = async (jti) => {
  if (!redisClient) return;
  await redisClient.del(refreshTokenKey(jti));
};

const revokeAccessToken = async (jti, expiresAtSeconds) => {
  if (!redisClient) return;
  const ttl = Math.max(expiresAtSeconds - Math.floor(Date.now() / 1000), 0);
  if (ttl > 0) {
    await redisClient.set(accessTokenBlacklistKey(jti), 'revoked', 'EX', ttl);
  }
};

const isAccessTokenRevoked = async (jti) => {
  if (!jti) {
    return false;
  }
  if (!redisClient) return false;
  return Boolean(await redisClient.exists(accessTokenBlacklistKey(jti)));
};

module.exports = {
  storeRefreshToken,
  validateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAccessToken,
  isAccessTokenRevoked,
};
