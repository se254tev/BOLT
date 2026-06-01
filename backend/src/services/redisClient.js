const Redis = require('ioredis');
const config = require('../config');

const redisUrl = process.env.REDIS_URL || config.redisUrl || null;

function createDisabledClient() {
  console.warn('REDIS_URL not set — Redis features will be disabled.');
  const noop = () => Promise.resolve(null);
  return {
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
}

if (!redisUrl) {
  module.exports = createDisabledClient();
} else {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redis.on('error', (err) => {
    console.error('Redis unavailable:', err.message);
  });

  module.exports = redis;
}
