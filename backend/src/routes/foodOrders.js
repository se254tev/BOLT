const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validate');
const { foodOrderSchema, orderStatusSchema } = require('../schemas/foodOrder');
const foodController = requireController('../controllers/foodController');

router.use(sanitize.sanitizeMiddleware);

router.post('/', authenticate, validateRequest(foodOrderSchema), foodController.createFoodOrder);
router.get('/:id', authenticate, validateObjectId('id'), foodController.getFoodOrder);
router.patch('/:id/status', authenticate, validateObjectId('id'), validateRequest(orderStatusSchema), foodController.updateFoodOrderStatus);

module.exports = router;
