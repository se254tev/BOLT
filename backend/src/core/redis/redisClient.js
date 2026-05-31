const Redis = require('ioredis');
const config = require('../../config');

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 5,
  enableReadyCheck: true,
  reconnectOnError: (err) => err && err.message && err.message.includes('READONLY'),
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => {
  console.error('Redis error', err.message);
});

redis.on('connect', () => {
  console.debug('Redis connected');
});

redis.on('close', () => {
  console.warn('Redis connection closed');
});

module.exports = redis;
