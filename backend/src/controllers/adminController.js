const adminService = require('../services/adminService');
const AuditLog = require('../models/auditLog');

const audit = async ({ adminId, action, resource, resourceId, ipAddress, userAgent }) => {
  await AuditLog.create({ adminId, action, resource, resourceId, ipAddress, userAgent });
};

const getAnalytics = async (req, res) => {
  const stats = await adminService.getAnalytics();
  await audit({ adminId: req.user.id, action: 'view_analytics', resource: 'analytics', ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ stats });
};

const moderateProduct = async (req, res) => {
  try {
    const product = await adminService.moderateProduct({ id: req.params.id, action: req.params.action });
    await audit({ adminId: req.user.id, action: `${req.params.action}_product`, resource: 'product', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    if (!product) return res.status(204).send();
    res.json({ product });
  } catch (err) {
    res.status(err.message === 'Product not found' ? 404 : 400).json({ error: err.message });
  }
};

const moderateProperty = async (req, res) => {
  try {
    const property = await adminService.moderateProperty({ id: req.params.id, action: req.params.action });
    await audit({ adminId: req.user.id, action: `${req.params.action}_property`, resource: 'property', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    if (!property) return res.status(204).send();
    res.json({ property });
  } catch (err) {
    res.status(err.message === 'Property not found' ? 404 : 400).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  req.params.action = 'delete';
  return moderateProduct(req, res);
};

const deleteProperty = async (req, res) => {
  req.params.action = 'delete';
  return moderateProperty(req, res);
};

const manageUser = async (req, res) => {
  try {
    const user = await adminService.manageUser({ id: req.params.id, action: req.params.action });
    await audit({ adminId: req.user.id, action: `${req.params.action}_user`, resource: 'user', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ user });
  } catch (err) {
    res.status(err.message === 'User not found' ? 404 : 400).json({ error: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await adminService.deleteReview({ id: req.params.id });
    await audit({ adminId: req.user.id, action: 'delete_review', resource: 'review', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.status(204).send();
  } catch (err) {
    res.status(err.message === 'Review not found' ? 404 : 400).json({ error: err.message });
  }
};

const manageCategory = async (req, res) => {
  await audit({ adminId: req.user.id, action: `category_${req.params.action}`, resource: 'category', resourceId: req.params.id || null, ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ message: `Category ${req.params.action}` });
};

const manageAds = async (req, res) => {
  await audit({ adminId: req.user.id, action: `ad_${req.params.action}`, resource: 'advertisement', resourceId: req.params.id || null, ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ message: `Advertisement ${req.params.action}` });
};

const platformSettings = async (req, res) => {
  await audit({ adminId: req.user.id, action: 'update_settings', resource: 'settings', ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ message: 'Settings updated' });
};

module.exports = {
  getAnalytics,
  moderateProduct,
  moderateProperty,
  deleteProduct,
  deleteProperty,
  manageUser,
  deleteReview,
  manageCategory,
  manageAds,
  platformSettings,
  // delivery agent admin
  listDeliveryAgents: async (req, res) => {
    const agents = await require('../models/user').find({ role: 'delivery_agent' }).select('-password -refreshTokens');
    await audit({ adminId: req.user.id, action: 'list_delivery_agents', resource: 'delivery_agent', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ agents });
  },
  verifyDeliveryAgent: async (req, res) => {
    const id = req.params.id;
    const User = require('../models/user');
    const agent = await User.findById(id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.isVerified = true;
    await agent.save();
    await audit({ adminId: req.user.id, action: 'verify_delivery_agent', resource: 'delivery_agent', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Agent verified' });
  },
  updateAgentStatus: async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const User = require('../models/user');
    const agent = await User.findById(id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.status = status;
    await agent.save();
    const deliveryStore = require('../core/redis/deliveryStore');
    await deliveryStore.setStatus(id, status);
    await audit({ adminId: req.user.id, action: 'admin_update_agent_status', resource: 'delivery_agent', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Agent status updated' });
  },
  suspendAgent: async (req, res) => {
    const id = req.params.id;
    const User = require('../models/user');
    const agent = await User.findById(id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.status = 'offline';
    agent.isVerified = false;
    await agent.save();
    await audit({ adminId: req.user.id, action: 'suspend_delivery_agent', resource: 'delivery_agent', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Agent suspended' });
  },
  // monetization admin
  getBoostRequests: async (req, res) => {
    const Property = require('../models/property');
    const requests = await Property.find({ boostStatus: 'pending' }).lean();
    await audit({ adminId: req.user.id, action: 'list_boost_requests', resource: 'property', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ requests });
  },
  approveBoost: async (req, res) => {
    const id = req.params.id;
    const Property = require('../models/property');
    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    prop.boostStatus = 'approved';
    prop.isFeatured = true;
    prop.featuredUntil = prop.boostEndDate || new Date(Date.now() + 7 * 24 * 3600 * 1000);
    prop.mockPaymentStatus = 'paid';
    await prop.save();
    await audit({ adminId: req.user.id, action: 'approve_boost', resource: 'property', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Boost approved', property: prop });
  },
  rejectBoost: async (req, res) => {
    const id = req.params.id;
    const Property = require('../models/property');
    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    prop.boostStatus = 'rejected';
    prop.isFeatured = false;
    prop.mockPaymentStatus = 'failed';
    await prop.save();
    await audit({ adminId: req.user.id, action: 'reject_boost', resource: 'property', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Boost rejected' });
  },
  verifyProperty: async (req, res) => {
    const id = req.params.id;
    const Property = require('../models/property');
    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    prop.isVerified = true;
    await prop.save();
    await audit({ adminId: req.user.id, action: 'verify_property', resource: 'property', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Property verified' });
  },
  verifyRestaurant: async (req, res) => {
    const id = req.params.id;
    const Restaurant = require('../models/restaurant');
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    restaurant.isVerified = true;
    await restaurant.save();
    await audit({ adminId: req.user.id, action: 'verify_restaurant', resource: 'restaurant', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Restaurant verified' });
  },
  suspendRestaurant: async (req, res) => {
    const id = req.params.id;
    const Restaurant = require('../models/restaurant');
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    restaurant.suspended = true;
    await restaurant.save();
    await audit({ adminId: req.user.id, action: 'suspend_restaurant', resource: 'restaurant', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Restaurant suspended' });
  },
  removeMealListing: async (req, res) => {
    const id = req.params.id;
    const { removeMeal } = require('../services/foodService');
    try {
      await removeMeal({ mealId: id, user: req.user });
      await audit({ adminId: req.user.id, action: 'remove_meal', resource: 'meal', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  getAgentSubscriptions: async (req, res) => {
    const AgentSubscription = require('../models/agentSubscription');
    const list = await AgentSubscription.find().populate('agentId', 'name email');
    await audit({ adminId: req.user.id, action: 'list_agent_subscriptions', resource: 'agent_subscription', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ subscriptions: list });
  },
  upgradeAgentPlan: async (req, res) => {
    const { agentId, planType, durationDays } = req.body;
    const { upgradeAgentPlan } = require('../services/subscriptionService');
    if (!agentId || !planType) return res.status(400).json({ error: 'agentId and planType required' });
    const sub = await upgradeAgentPlan(agentId, planType, durationDays || 365);
    await audit({ adminId: req.user.id, action: 'upgrade_agent_plan', resource: 'agent_subscription', resourceId: agentId, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ subscription: sub });
  },
  getFoodAnalytics: async (req, res) => {
    const foodAnalytics = require('../services/foodAnalyticsService');
    const meals = await foodAnalytics.topMeals(10);
    const restaurants = await foodAnalytics.topRestaurants(10);
    const categories = await foodAnalytics.categoryPopularity();
    const conversionRate = await foodAnalytics.conversionRate();
    await audit({ adminId: req.user.id, action: 'view_food_analytics', resource: 'food_analytics', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ analytics: { topMeals: meals, topRestaurants: restaurants, categoryPopularity: categories, conversionRate } });
  },
};
