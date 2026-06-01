const redisClient = require('../core/redis/redisClient');

const health = async (req, res) => {
  const redisOk = redisClient ? await redisClient.ping().then(() => true).catch(() => false) : false;
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    redis: redisOk ? 'connected' : 'unavailable',
    requestId: req.requestId,
  });
};

const ready = async (req, res) => {
  const mongoConnected = req.app.locals.mongoConnected;
  const redisOk = redisClient ? await redisClient.ping().then(() => true).catch(() => false) : false;
  res.status(mongoConnected && redisOk ? 200 : 503).json({
    ready: mongoConnected && redisOk,
    mongoConnected,
    redisConnected: redisOk,
    requestId: req.requestId,
  });
};

const redisStatus = async (req, res) => {
  if (!redisClient) return res.status(200).json({ status: 'degraded', redis: 'unavailable' });
  const ok = await redisClient.ping().then(() => true).catch(() => false);
  if (ok) return res.status(200).json({ status: 'ok', redis: 'connected' });
  return res.status(503).json({ status: 'degraded', redis: 'unavailable' });
};

module.exports = { health, ready, redisStatus };
