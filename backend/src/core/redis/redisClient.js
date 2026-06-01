const Redis = require('ioredis');

// Use only process.env.REDIS_URL per policy
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('REDIS_URL not configured. Redis features disabled.');
  module.exports = null;
} else {
  const redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  redis.on('connect', () => {
    console.log('\u2705 Redis connected');
  });

  redis.on('ready', () => {
    console.log('\u2705 Redis ready');
  });

  redis.on('error', (err) => {
    console.error('\u274C Redis error:', err && err.message ? err.message : err);
  });

  module.exports = redis;
}
