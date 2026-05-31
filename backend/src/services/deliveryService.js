const DeliveryOrder = require('../models/deliveryOrder');
const FoodOrder = require('../models/foodOrder');
const Product = require('../models/product');
const User = require('../models/user');
const deliveryStore = require('../core/redis/deliveryStore');
const AuditLog = require('../models/auditLog');

const DELIVERY_TRANSITIONS = {
  pending_assignment: ['assigned', 'cancelled'],
  assigned: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'failed', 'cancelled'],
  in_transit: ['delivered', 'failed', 'cancelled'],
  delivered: [],
  failed: ['cancelled'],
  cancelled: [],
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findNearbyAgents = async (lat, lng, limit = 5) => {
  const agentIds = await deliveryStore.getAvailableAgents();
  const candidates = [];
  for (const id of agentIds) {
    const loc = await deliveryStore.getLocation(id);
    if (!loc) continue;
    const user = await User.findById(id).select('isVerified rating status');
    if (!user || !user.isVerified || user.status !== 'available') continue;
    const dist = haversineDistance(lat, lng, loc.lat, loc.lng);
    candidates.push({ id, dist, rating: user.rating });
  }
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates.slice(0, limit);
};

const getDeliveryOrder = async (id) => DeliveryOrder.findById(id);

const getAgent = async (id) => User.findById(id).select('-password -refreshTokens');

const createDeliveryOrder = async ({ buyerId, sellerId, productId, pickupLocation, dropoffLocation, fee = 0, deliveryMode = 'seller_delivery', foodOrderId = null }) => {
  const product = await Product.findById(productId).select('sellerId suspended verified');
  if (!product) {
    throw new Error('Product not found');
  }
  if (String(product.sellerId) !== String(sellerId)) {
    throw new Error('Seller does not own this product');
  }
  if (product.suspended) {
    throw new Error('Product is unavailable');
  }
  if (!product.verified) {
    throw new Error('Product is not verified');
  }

  const status = deliveryMode === 'platform_delivery' ? 'pending_assignment' : 'assigned';
  const order = await DeliveryOrder.create({
    buyerId,
    sellerId,
    productId,
    foodOrderId,
    pickupLocation,
    dropoffLocation,
    fee,
    deliveryMode,
    status,
  });
  await AuditLog.create({ adminId: buyerId, action: 'create_delivery_order', resource: 'delivery_order', resourceId: order.id });
  return order;
};

const assignNearestAgent = async (orderId) => {
  const order = await DeliveryOrder.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (order.deliveryMode !== 'platform_delivery') throw new Error('Not a platform delivery');
  if (order.status !== 'pending_assignment') throw new Error('Delivery order is not pending assignment');

  const { pickupLocation } = order;
  const nearby = await findNearbyAgents(pickupLocation.lat, pickupLocation.lng, 5);
  if (nearby.length === 0) return null;
  const chosen = nearby[0];
  order.deliveryAgentId = chosen.id;
  order.status = 'assigned';
  await order.save();
  await AuditLog.create({ adminId: order.buyerId, action: 'assign_delivery_agent', resource: 'delivery_order', resourceId: order.id, ipAddress: null, userAgent: null });
  return { order, agent: chosen };
};

const syncFoodOrderStatus = async (order, status) => {
  if (!order.foodOrderId) return;
  const foodOrder = await FoodOrder.findById(order.foodOrderId);
  if (!foodOrder) return;

  if (status === 'picked_up' && foodOrder.status === 'ready_for_pickup') {
    foodOrder.status = 'out_for_delivery';
  }

  if (status === 'delivered' && !['completed', 'cancelled', 'refunded'].includes(foodOrder.status)) {
    foodOrder.status = 'completed';
    if (foodOrder.orderPaymentStatus !== 'paid') {
      foodOrder.orderPaymentStatus = 'paid';
    }
  }

  if (['failed', 'cancelled'].includes(status) && !['completed', 'cancelled', 'refunded'].includes(foodOrder.status)) {
    foodOrder.status = 'cancelled';
    foodOrder.orderPaymentStatus = 'failed';
  }

  await foodOrder.save();
};

const updateOrderStatus = async (orderId, status, actor) => {
  const order = await DeliveryOrder.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (!DELIVERY_TRANSITIONS[order.status]?.includes(status)) {
    throw new Error(`Invalid transition from ${order.status} to ${status}`);
  }

  const isAgent = actor && order.deliveryAgentId && String(order.deliveryAgentId) === String(actor.id);
  const isSeller = actor && String(order.sellerId) === String(actor.id);
  const isBuyer = actor && String(order.buyerId) === String(actor.id);
  const isAdmin = actor && actor.role === 'admin';

  if (['picked_up', 'in_transit', 'delivered', 'failed'].includes(status)) {
    if (order.deliveryMode === 'platform_delivery' && !isAgent && !isAdmin) {
      throw new Error('Only the assigned agent may update this delivery status');
    }
    if (order.deliveryMode === 'seller_delivery' && !isSeller && !isAdmin) {
      throw new Error('Only the seller may update this delivery status');
    }
  }

  if (status === 'assigned') {
    if (order.deliveryMode === 'platform_delivery' && !isAdmin) {
      throw new Error('Only administrators may assign platform delivery orders');
    }
    if (order.deliveryMode === 'seller_delivery' && !isSeller && !isAdmin) {
      throw new Error('Only the seller may confirm a seller delivery assignment');
    }
  }

  if (status === 'cancelled' && !isBuyer && !isSeller && !isAgent && !isAdmin) {
    throw new Error('Unauthorized to cancel this delivery');
  }

  order.status = status;
  await order.save();
  await AuditLog.create({ adminId: actor?.id || null, action: `delivery_status_${status}`, resource: 'delivery_order', resourceId: order.id, ipAddress: null, userAgent: null });
  await syncFoodOrderStatus(order, status);
  return order;
};

module.exports = {
  findNearbyAgents,
  getDeliveryOrder,
  getAgent,
  createDeliveryOrder,
  assignNearestAgent,
  updateOrderStatus,
};
