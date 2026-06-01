const Redis = require('ioredis');

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
    console.log('Redis connected');
  });

  redis.on('ready', () => {
    console.log('Redis ready');
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err && err.message ? err.message : err);
  });

  module.exports = redis;
}
