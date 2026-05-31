const redisClient = require('../core/redis/redisClient');

const health = async (req, res) => {
  const redisOk = await redisClient.ping().then(() => true).catch(() => false);
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    redis: redisOk ? 'connected' : 'unavailable',
    requestId: req.requestId,
  });
};

const ready = async (req, res) => {
  const mongoConnected = req.app.locals.mongoConnected;
  const redisOk = await redisClient.ping().then(() => true).catch(() => false);
  res.status(mongoConnected && redisOk ? 200 : 503).json({
    ready: mongoConnected && redisOk,
    mongoConnected,
    redisConnected: redisOk,
    requestId: req.requestId,
  });
};

module.exports = { health, ready };
