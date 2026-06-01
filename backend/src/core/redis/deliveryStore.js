const redisClient = require('./redisClient');

const locationKey = (agentId) => `delivery:location:${agentId}`;
const statusKey = (agentId) => `delivery:agent:status:${agentId}`;
const availableSet = 'delivery:agents:available';

const setLocation = async (agentId, lat, lng) => {
  if (!redisClient) {
    console.warn('Redis not configured — setLocation is a no-op');
    return;
  }
  const payload = JSON.stringify({ lat, lng, ts: Date.now() });
  await redisClient.set(locationKey(agentId), payload);
};

const getLocation = async (agentId) => {
  if (!redisClient) return null;
  const raw = await redisClient.get(locationKey(agentId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
};

const setStatus = async (agentId, status) => {
  if (!redisClient) {
    console.warn('Redis not configured — setStatus is a no-op');
    return;
  }
  await redisClient.set(statusKey(agentId), status);
  if (status === 'available') {
    await redisClient.sadd(availableSet, agentId.toString());
  } else {
    await redisClient.srem(availableSet, agentId.toString());
  }
};

const getStatus = async (agentId) => {
  if (!redisClient) return null;
  return await redisClient.get(statusKey(agentId));
};

const getAvailableAgents = async () => {
  if (!redisClient) return [];
  return await redisClient.smembers(availableSet);
};

module.exports = { setLocation, getLocation, setStatus, getStatus, getAvailableAgents };
