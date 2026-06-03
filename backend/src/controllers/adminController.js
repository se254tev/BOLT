const adminService = require('../services/adminService');
const AuditLog = require('../models/auditLog');
const Category = require('../models/category');
const Ad = require('../models/ad');
const Restaurant = require('../models/restaurant');
const { ServiceRequest, ServiceWorker, ServiceBid, ServiceReview } = require('../services/requests/models');

const audit = async ({ adminId, action, resource, resourceId, ipAddress, userAgent }) => {
  await AuditLog.create({ adminId, action, resource, resourceId, ipAddress, userAgent });
};

const getAnalytics = async (req, res) => {
  const stats = await adminService.getAnalytics();
  await audit({ adminId: req.user.id, action: 'view_analytics', resource: 'analytics', ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ stats });
};

const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    await audit({ adminId: req.user.id, action: 'list_categories', resource: 'category', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to list categories' });
  }
};

const listAds = async (req, res) => {
  try {
    const ads = await Ad.find().lean();
    await audit({ adminId: req.user.id, action: 'list_ads', resource: 'advertisement', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ ads });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to list ads' });
  }
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
  try {
    const { action } = req.params;
    const { name } = req.body;

    if (action !== 'delete' && !name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    let category;
    if (action === 'create') {
      category = await Category.create({ name });
      await audit({ adminId: req.user.id, action: 'create_category', resource: 'category', resourceId: category.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      return res.status(201).json({ category });
    }

    if (action === 'update') {
      category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
      if (!category) return res.status(404).json({ error: 'Category not found' });
      await audit({ adminId: req.user.id, action: 'update_category', resource: 'category', resourceId: category.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      return res.json({ category });
    }

    if (action === 'delete') {
      category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      await Category.deleteOne({ _id: req.params.id });
      await audit({ adminId: req.user.id, action: 'delete_category', resource: 'category', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      return res.json({ message: 'Category deleted' });
    }

    res.status(400).json({ error: 'Invalid category action' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to manage category' });
  }
};

const manageAds = async (req, res) => {
  try {
    const { action } = req.params;
    const { title, slot, imageUrl, link } = req.body;

    if (action !== 'delete' && !title) {
      return res.status(400).json({ error: 'Ad title is required' });
    }

    let ad;
    if (action === 'create') {
      ad = await Ad.create({ title, slot, imageUrl, link });
      await audit({ adminId: req.user.id, action: 'create_ad', resource: 'advertisement', resourceId: ad.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      return res.status(201).json({ ad });
    }

    if (action === 'update') {
      ad = await Ad.findByIdAndUpdate(req.params.id, { title, slot, imageUrl, link }, { new: true });
      if (!ad) return res.status(404).json({ error: 'Ad not found' });
      await audit({ adminId: req.user.id, action: 'update_ad', resource: 'advertisement', resourceId: ad.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      return res.json({ ad });
    }

    if (action === 'delete') {
      ad = await Ad.findById(req.params.id);
      if (!ad) return res.status(404).json({ error: 'Ad not found' });
      await Ad.deleteOne({ _id: req.params.id });
      await audit({ adminId: req.user.id, action: 'delete_ad', resource: 'advertisement', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
      return res.json({ message: 'Advertisement deleted' });
    }

    res.status(400).json({ error: 'Invalid advertisement action' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to manage advertisement' });
  }
};

const platformSettings = async (req, res) => {
  try {
    await audit({ adminId: req.user.id, action: 'update_settings', resource: 'settings', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
};

module.exports = {
  getAnalytics,
  moderateProduct,
  moderateProperty,
  deleteProduct,
  deleteProperty,
  manageUser,
  deleteReview,
  listCategories,
  listAds,
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
  listRestaurants: async (req, res) => {
    const query = {};
    if (req.query.verified) {
      query.isVerified = req.query.verified === 'true';
    }
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
      ];
    }
    const restaurants = await Restaurant.find(query).lean();
    await audit({ adminId: req.user.id, action: 'list_restaurants', resource: 'restaurant', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ restaurants });
  },
  getRestaurant: async (req, res) => {
    const id = req.params.id;
    const restaurant = await Restaurant.findById(id).lean();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    await audit({ adminId: req.user.id, action: 'view_restaurant', resource: 'restaurant', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ restaurant });
  },
  listServiceRequests: async (req, res) => {
    const query = {};
    if (req.query.status) query.requestState = req.query.status;
    if (req.query.type) query.requestType = req.query.type;
    if (req.query.search) {
      query.$or = [
        { _id: req.query.search },
        { 'rideDetails.pickupLocation': new RegExp(req.query.search, 'i') },
        { 'rideDetails.destination': new RegExp(req.query.search, 'i') },
        { 'errandDetails.taskDescription': new RegExp(req.query.search, 'i') },
      ];
    }
    const requests = await ServiceRequest.find(query)
      .populate('userId', 'name email')
      .populate('assignedWorkerId', 'userId role serviceType')
      .lean();
    await audit({ adminId: req.user.id, action: 'list_service_requests', resource: 'service_request', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ requests });
  },
  getServiceRequest: async (req, res) => {
    const id = req.params.id;
    const request = await ServiceRequest.findById(id)
      .populate('userId', 'name email')
      .populate('assignedWorkerId', 'userId role serviceType')
      .populate('selectedBidId')
      .lean();
    if (!request) return res.status(404).json({ error: 'Service request not found' });
    await audit({ adminId: req.user.id, action: 'view_service_request', resource: 'service_request', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ request });
  },
  listServiceWorkers: async (req, res) => {
    const workers = await ServiceWorker.find().populate('userId', 'name email').lean();
    await audit({ adminId: req.user.id, action: 'list_service_workers', resource: 'service_worker', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ workers });
  },
  approveServiceWorker: async (req, res) => {
    const id = req.params.id;
    const worker = await ServiceWorker.findById(id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.isVerified = true;
    worker.verificationStatus = 'approved';
    await worker.save();
    await audit({ adminId: req.user.id, action: 'approve_service_worker', resource: 'service_worker', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ worker });
  },
  rejectServiceWorker: async (req, res) => {
    const id = req.params.id;
    const worker = await ServiceWorker.findById(id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.isVerified = false;
    worker.verificationStatus = 'rejected';
    await worker.save();
    await audit({ adminId: req.user.id, action: 'reject_service_worker', resource: 'service_worker', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ worker });
  },
  updateServiceWorkerStatus: async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const worker = await ServiceWorker.findById(id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.availabilityStatus = status;
    await worker.save();
    await audit({ adminId: req.user.id, action: 'update_service_worker_status', resource: 'service_worker', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ worker });
  },
  listServiceBids: async (req, res) => {
    const query = {};
    if (req.query.requestId) query.requestId = req.query.requestId;
    if (req.query.status) query.status = req.query.status;
    const bids = await ServiceBid.find(query).lean();
    await audit({ adminId: req.user.id, action: 'list_service_bids', resource: 'service_bid', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ bids });
  },
  listServiceReviews: async (req, res) => {
    const query = {};
    if (req.query.requestId) query.requestId = req.query.requestId;
    if (req.query.workerId) query.workerId = req.query.workerId;
    const reviews = await ServiceReview.find(query)
      .populate('userId', 'name email')
      .populate('workerId', 'serviceType')
      .lean();
    await audit({ adminId: req.user.id, action: 'list_service_reviews', resource: 'service_review', ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ reviews });
  },
  hideServiceReview: async (req, res) => {
    const id = req.params.id;
    const review = await ServiceReview.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.isHidden = true;
    await review.save();
    await audit({ adminId: req.user.id, action: 'hide_service_review', resource: 'service_review', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ review });
  },
  flagServiceReview: async (req, res) => {
    const id = req.params.id;
    const review = await ServiceReview.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.flagged = true;
    review.flaggedReason = req.body.reason || 'Flagged by admin';
    await review.save();
    await audit({ adminId: req.user.id, action: 'flag_service_review', resource: 'service_review', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ review });
  },
  deleteServiceReview: async (req, res) => {
    const id = req.params.id;
    const review = await ServiceReview.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await ServiceReview.deleteOne({ _id: id });
    await audit({ adminId: req.user.id, action: 'delete_service_review', resource: 'service_review', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.status(204).send();
  },
  listAuditLogs: async (req, res) => {
    const query = {};
    if (req.query.adminId) query.adminId = req.query.adminId;
    if (req.query.action) query.action = req.query.action;
    if (req.query.resource) query.resource = req.query.resource;
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(200).lean();
    res.json({ logs });
  },
  approveSeller: async (req, res) => {
    try {
      const id = req.params.id;
      const User = require('../models/user');
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.sellerStatus === 'active' || user.sellerStatus === 'approved') {
        return res.status(400).json({ error: 'Seller application is already approved or active' });
      }
      if (user.sellerStatus !== 'pending' && user.sellerStatus !== 'rejected') {
        return res.status(400).json({ error: 'Seller application must be pending or rejected to approve' });
      }
      user.sellerStatus = 'approved';
      user.approvedAt = new Date();
      user.approvedBy = req.user.id;
      user.sellerApplication = user.sellerApplication || {};
      user.sellerApplication.reviewedAt = new Date();
      user.sellerApplication.reviewedBy = req.user.id;
      await user.save();
      await AuditLog.create({ adminId: req.user.id, action: 'approve_seller', resource: 'user', resourceId: id });
      res.json({ sellerStatus: user.sellerStatus });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  listPendingSellers: async (req, res) => {
    try {
      const User = require('../models/user');
      const list = await User.find({ sellerStatus: 'pending' }).select('-password -mfaSecret -mfaTempSecret -refreshTokens').lean();
      await audit({ adminId: req.user.id, action: 'list_pending_sellers', resource: 'user', ipAddress: req.ip, userAgent: req.get('User-Agent') });
      res.json({ sellers: list });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  rejectSeller: async (req, res) => {
    try {
      const id = req.params.id;
      const { rejectionReason } = req.body;
      const User = require('../models/user');
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.sellerStatus === 'active') {
        return res.status(400).json({ error: 'Active seller accounts cannot be rejected' });
      }
      if (user.sellerStatus !== 'pending' && user.sellerStatus !== 'approved' && user.sellerStatus !== 'rejected') {
        return res.status(400).json({ error: 'Seller application must be pending, approved, or rejected to reject' });
      }
      user.sellerStatus = 'rejected';
      user.rejectedAt = new Date();
      user.rejectionReason = rejectionReason || 'Rejected by admin';
      user.sellerApplication = user.sellerApplication || {};
      user.sellerApplication.reviewedAt = new Date();
      user.sellerApplication.reviewedBy = req.user.id;
      user.sellerApplication.rejectionReason = user.rejectionReason;
      await user.save();
      await AuditLog.create({ adminId: req.user.id, action: 'reject_seller', resource: 'user', resourceId: id, metadata: { rejectionReason: user.rejectionReason } });
      res.json({ sellerStatus: user.sellerStatus, rejectionReason: user.rejectionReason });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
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
