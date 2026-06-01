const Redis = require('ioredis');
const config = require('../../config');

// Prefer explicit environment variable for Redis URL
const redisUrl = process.env.REDIS_URL || config.redisUrl || null;

function createDisabledClient() {
  console.warn('REDIS_URL not set — Redis features will be disabled.');
  const noop = () => Promise.resolve(null);
  const stub = {
    on: () => {},
    once: () => {},
    ping: () => Promise.reject(new Error('Redis disabled')),
    get: noop,
    set: noop,
    del: noop,
    incr: () => Promise.resolve(0),
    expire: () => Promise.resolve(0),
    multi: () => ({ exec: () => Promise.resolve([]) }),
    call: noop,
    exists: () => Promise.resolve(0),
    smembers: () => Promise.resolve([]),
    sadd: () => Promise.resolve(0),
    srem: () => Promise.resolve(0),
  };
  return stub;
}

if (!redisUrl) {
  module.exports = createDisabledClient();
} else {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 5,
    enableReadyCheck: true,
    reconnectOnError: (err) => err && err.message && err.message.includes('READONLY'),
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  redis.on('error', (err) => {
    console.error('Redis unavailable:', err.message);
  });

  redis.on('connect', () => {
    console.debug('Redis connected');
  });

  redis.on('close', () => {
    console.warn('Redis connection closed');
  });

  module.exports = redis;
}
