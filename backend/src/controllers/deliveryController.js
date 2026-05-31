const DeliveryService = require('../services/deliveryService');
const deliveryStore = require('../core/redis/deliveryStore');

const getNearbyAgents = async (req, res) => {
  const { lat, lng, limit } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const list = await DeliveryService.findNearbyAgents(parseFloat(lat), parseFloat(lng), parseInt(limit || '5', 10));
  res.json({ agents: list });
};

const getAgent = async (req, res) => {
  const agent = await DeliveryService.getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent });
};

const updateLocation = async (req, res) => {
  const data = req.validated; // lat,lng
  const agentId = req.user.id;
  await deliveryStore.setLocation(agentId, data.lat, data.lng);
  res.json({ message: 'Location updated' });
};

const createOrder = async (req, res) => {
  const payload = req.validated;
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Only buyers may create delivery orders' });
  const order = await DeliveryService.createDeliveryOrder({
    buyerId: req.user.id,
    sellerId: payload.sellerId,
    productId: payload.productId,
    pickupLocation: payload.pickupLocation,
    dropoffLocation: payload.dropoffLocation,
    fee: payload.fee,
    deliveryMode: payload.deliveryMode,
  });
  if (order.deliveryMode === 'platform_delivery') {
    await DeliveryService.assignNearestAgent(order.id);
  }
  res.status(201).json({ order });
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.validated;
  const orderId = req.params.id;
  const order = await DeliveryService.getDeliveryOrder(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  try {
    const updated = await DeliveryService.updateOrderStatus(orderId, status, req.user);
    res.json({ order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getNearbyAgents, getAgent, updateLocation, createOrder, updateOrderStatus };
