const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { createDeliverySchema, updateLocationSchema, updateStatusSchema } = require('../schemas/delivery');
const deliveryController = requireController('../controllers/deliveryController');

router.use(sanitize.sanitizeMiddleware);

router.get('/agents/nearby', deliveryController.getNearbyAgents);
router.get('/agents/:id', validateObjectId('id'), deliveryController.getAgent);

router.patch('/agents/location', authenticate, authorize(['delivery_agent']), validateRequest(updateLocationSchema), deliveryController.updateLocation);

router.post('/orders', authenticate, validateRequest(createDeliverySchema), deliveryController.createOrder);
router.patch('/orders/:id/status', authenticate, validateObjectId('id'), validateRequest(updateStatusSchema), deliveryController.updateOrderStatus);

module.exports = router;
