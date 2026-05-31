const Restaurant = require('../models/restaurant');
const { Meal } = require('../models/meal');
const FoodOrder = require('../models/foodOrder');
const deliveryService = require('./deliveryService');
const AuditLog = require('../models/auditLog');

const FOOD_ORDER_TRANSITIONS = {
  created: ['payment_pending'],
  payment_pending: ['paid', 'cancelled'],
  paid: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  rejected: ['refunded'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['out_for_delivery', 'completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['refunded'],
  refunded: [],
};

const DELIVERY_MODE_MAP = {
  delivery: 'platform_delivery',
  rider: 'seller_delivery',
};

const isRestaurantOwner = (restaurant, user) => restaurant && restaurant.ownerId?.toString() === user.id;

const createRestaurant = async ({ user, payload }) => {
  const rest = await Restaurant.create({ ...payload, ownerId: user.id, isVerified: false });
  await AuditLog.create({ adminId: user.id, action: 'create_restaurant', resource: 'restaurant', resourceId: rest.id });
  return rest;
};

const listRestaurants = async ({ search, verified }) => {
  const filter = { suspended: { $ne: true } };
  if (search) filter.name = new RegExp(search, 'i');
  if (verified === 'true') filter.isVerified = true;
  return Restaurant.find(filter).lean();
};

const getRestaurant = async (id) => Restaurant.findById(id);

const createMeal = async ({ user, payload }) => {
  const restaurant = await Restaurant.findById(payload.restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  if (restaurant.ownerId.toString() !== user.id) throw new Error('Only restaurant owners can create meals');
  const existing = await Meal.findOne({ restaurantId: payload.restaurantId, name: payload.name });
  if (existing) throw new Error('Duplicate meal listing');
  const meal = await Meal.create({
    ...payload,
    restaurantName: restaurant.name,
  });
  await AuditLog.create({ adminId: user.id, action: 'create_meal', resource: 'meal', resourceId: meal.id });
  return meal;
};

const listMeals = async ({ search, category, restaurantId, sortBy }) => {
  const filter = { isAvailable: true };
  if (search) filter.name = new RegExp(search, 'i');
  if (category) filter.category = category;
  if (restaurantId) filter.restaurantId = restaurantId;
  let query = Meal.find(filter);
  if (sortBy === 'price_asc') query = query.sort({ price: 1 });
  else if (sortBy === 'price_desc') query = query.sort({ price: -1 });
  else if (sortBy === 'rating') query = query.sort({ rating: -1 });
  else query = query.sort({ createdAt: -1 });
  return query.lean();
};

const getMeal = async (id) => Meal.findById(id);

const removeMeal = async ({ mealId, user }) => {
  const meal = await Meal.findById(mealId);
  if (!meal) throw new Error('Meal not found');
  const restaurant = await Restaurant.findById(meal.restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  if (!isRestaurantOwner(restaurant, user) && user.role !== 'admin') throw new Error('Unauthorized');
  await Meal.deleteOne({ _id: mealId });
  await AuditLog.create({ adminId: user.id, action: 'delete_meal', resource: 'meal', resourceId: mealId });
  return true;
};

const createFoodOrder = async ({ user, payload }) => {
  const restaurant = await Restaurant.findById(payload.restaurantId);
  if (!restaurant || restaurant.suspended) throw new Error('Restaurant not available');

  const mealIds = payload.mealItems.map((item) => item.mealId);
  const meals = await Meal.find({ _id: { $in: mealIds }, restaurantId: payload.restaurantId });
  if (meals.length !== payload.mealItems.length) throw new Error('One or more meals are invalid');

  const totalAmount = payload.mealItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderPaymentStatus = payload.orderPaymentStatus || 'pending';
  const status = orderPaymentStatus === 'paid' ? 'paid' : 'payment_pending';
  const dropoffLocation = payload.dropoffLocation || (user.currentLocation?.lat && user.currentLocation?.lng ? {
    lat: user.currentLocation.lat,
    lng: user.currentLocation.lng,
  } : undefined);

  if (['delivery', 'rider'].includes(payload.deliveryMode) && !dropoffLocation) {
    throw new Error('Dropoff location is required for delivery or rider orders');
  }

  const order = await FoodOrder.create({
    buyerId: user.id,
    restaurantId: restaurant.id,
    mealItems: payload.mealItems,
    totalAmount,
    deliveryMode: payload.deliveryMode,
    deliveryAddress: payload.deliveryAddress,
    dropoffLocation,
    orderPaymentStatus,
    status,
  });

  await AuditLog.create({ adminId: user.id, action: 'create_food_order', resource: 'food_order', resourceId: order.id });
  return order;
};

const getFoodOrder = async (id) => FoodOrder.findById(id);

const attachDeliveryOrder = async (order, restaurant) => {
  if (!['delivery', 'rider'].includes(order.deliveryMode)) return null;
  if (!order.dropoffLocation) throw new Error('Dropoff location is required for delivery orders');
  if (!restaurant?.location?.lat || !restaurant?.location?.lng) throw new Error('Restaurant pickup location is not configured');
  const deliveryMode = DELIVERY_MODE_MAP[order.deliveryMode];
  const deliveryOrder = await deliveryService.createDeliveryOrder({
    buyerId: order.buyerId,
    sellerId: restaurant.ownerId,
    foodOrderId: order.id,
    pickupLocation: restaurant.location,
    dropoffLocation: order.dropoffLocation,
    fee: 0,
    deliveryMode,
  });
  order.deliveryOrderId = deliveryOrder.id;
  await order.save();
  if (deliveryMode === 'platform_delivery') {
    await deliveryService.assignNearestAgent(deliveryOrder.id);
  }
  return deliveryOrder;
};

const updateFoodOrderStatus = async ({ id, status, user }) => {
  const order = await FoodOrder.findById(id);
  if (!order) throw new Error('Order not found');
  if (!FOOD_ORDER_TRANSITIONS[order.status]?.includes(status)) {
    throw new Error(`Invalid transition from ${order.status} to ${status}`);
  }

  const restaurant = await Restaurant.findById(order.restaurantId);
  const restaurantOwner = isRestaurantOwner(restaurant, user);
  const buyer = order.buyerId.toString() === user.id;
  const agent = order.deliveryAgentId?.toString() === user.id;
  const isAdmin = user.role === 'admin';

  if (status === 'paid') {
    if (!buyer && !isAdmin) throw new Error('Only the buyer may mark an order as paid');
    order.orderPaymentStatus = 'paid';
  }

  if (['accepted', 'rejected', 'preparing', 'ready_for_pickup', 'cancelled'].includes(status)) {
    if (!restaurantOwner && !isAdmin) throw new Error('Only restaurant owners may update this order status');
    if (status === 'accepted' && order.orderPaymentStatus !== 'paid') {
      throw new Error('Cannot accept an order that has not been paid');
    }
  }

  if (status === 'out_for_delivery') {
    if (!restaurantOwner && !isAdmin) throw new Error('Only restaurant owners may mark food as out for delivery');
    if (order.deliveryMode === 'pickup') {
      throw new Error('Pickup orders cannot transition to out_for_delivery');
    }
  }

  if (status === 'completed' && order.deliveryMode === 'delivery' && order.deliveryOrderId && !agent && !isAdmin) {
    throw new Error('Delivery completion is managed by the delivery service for delivery orders');
  }

  if (status === 'refunded' && !isAdmin) {
    throw new Error('Only administrators may refund orders');
  }

  if (status === 'cancelled' && order.orderPaymentStatus === 'paid') {
    order.orderPaymentStatus = 'failed';
  }

  order.status = status;

  if (status === 'ready_for_pickup' && ['delivery', 'rider'].includes(order.deliveryMode)) {
    await attachDeliveryOrder(order, restaurant);
  }

  if (status === 'completed') {
    await Meal.updateMany(
      { _id: { $in: order.mealItems.map((item) => item.mealId) } },
      { $inc: { orderCount: 1 } },
    );
  }

  await order.save();
  await AuditLog.create({ adminId: user.id, action: `food_order_status_${status}`, resource: 'food_order', resourceId: id });
  return order;
};

module.exports = {
  createRestaurant,
  listRestaurants,
  getRestaurant,
  createMeal,
  listMeals,
  getMeal,
  removeMeal,
  createFoodOrder,
  getFoodOrder,
  updateFoodOrderStatus,
};
