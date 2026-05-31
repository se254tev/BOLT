const Redis = require('ioredis');
const config = require('../config');

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('error', (err) => {
  // avoid logging sensitive details
  console.error('Redis error', err.message);
});

module.exports = redis;
