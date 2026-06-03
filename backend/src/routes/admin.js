const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const { requireController } = require('../utils/requireController');
const adminController = requireController('../controllers/adminController');
const adminPaymentsController = requireController('../controllers/adminPaymentsController');

router.get('/analytics', adminController.getAnalytics);
router.get('/stats', adminController.getAnalytics);
router.get('/payments', adminPaymentsController.listPayments);
router.get('/payments/:id', validateObjectId('id'), adminPaymentsController.getPayment);
router.post('/payments/:id/approve', validateObjectId('id'), adminPaymentsController.approvePayment);
router.post('/payments/:id/reject', validateObjectId('id'), adminPaymentsController.rejectPayment);
router.post('/payments/:id/override', validateObjectId('id'), adminPaymentsController.overridePayment);
router.post('/payments/:id/suspend-seller', validateObjectId('id'), adminPaymentsController.suspendSeller);
router.patch('/products/:action(approve|reject)/:id', adminController.moderateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/properties/:action(approve|reject)/:id', adminController.moderateProperty);
router.delete('/properties/:id', adminController.deleteProperty);
router.patch('/seller/:id/approve', validateObjectId('id'), adminController.approveSeller);
router.patch('/seller/:id/reject', validateObjectId('id'), adminController.rejectSeller);
router.get('/sellers/pending', adminController.listPendingSellers);
router.get('/restaurants', adminController.listRestaurants);
router.get('/restaurants/:id', validateObjectId('id'), adminController.getRestaurant);
router.patch('/restaurants/verify/:id', adminController.verifyRestaurant);
router.patch('/restaurants/suspend/:id', adminController.suspendRestaurant);

router.get('/service-requests', adminController.listServiceRequests);
router.get('/service-requests/:id', validateObjectId('id'), adminController.getServiceRequest);
router.get('/service-workers', adminController.listServiceWorkers);
router.patch('/service-workers/:id/status', validateObjectId('id'), adminController.updateServiceWorkerStatus);
router.post('/service-workers/:id/approve', validateObjectId('id'), adminController.approveServiceWorker);
router.post('/service-workers/:id/reject', validateObjectId('id'), adminController.rejectServiceWorker);
router.get('/service-bids', adminController.listServiceBids);
router.get('/service-reviews', adminController.listServiceReviews);
router.patch('/service-reviews/:id/hide', validateObjectId('id'), adminController.hideServiceReview);
router.patch('/service-reviews/:id/flag', validateObjectId('id'), adminController.flagServiceReview);
router.delete('/service-reviews/:id', validateObjectId('id'), adminController.deleteServiceReview);
router.get('/audit-logs', adminController.listAuditLogs);

router.delete('/meals/:id', adminController.removeMealListing);
router.get('/food/analytics', adminController.getFoodAnalytics);
router.patch('/users/:action(suspend|activate)/:id', adminController.manageUser);
router.delete('/reviews/:id', adminController.deleteReview);
router.get('/categories', adminController.listCategories);
router.post('/categories/:action(create|update|delete)/:id?', adminController.manageCategory);
router.get('/ads', adminController.listAds);
router.post('/ads/:action(create|update|delete)/:id?', adminController.manageAds);
router.put('/settings', adminController.platformSettings);
router.get('/delivery-agents', adminController.listDeliveryAgents);
router.patch('/delivery-agents/verify/:id', adminController.verifyDeliveryAgent);
router.patch('/delivery-agents/status/:id', adminController.updateAgentStatus);
router.patch('/delivery-agents/suspend/:id', adminController.suspendAgent);

// Monetization admin endpoints
router.get('/properties/boost-requests', adminController.getBoostRequests);
router.post('/properties/approve-boost/:id', adminController.approveBoost);
router.patch('/properties/reject-boost/:id', adminController.rejectBoost);
router.patch('/properties/verify/:id', adminController.verifyProperty);

router.get('/agents/subscriptions', adminController.getAgentSubscriptions);
router.patch('/agents/upgrade-plan', adminController.upgradeAgentPlan);

module.exports = router;
