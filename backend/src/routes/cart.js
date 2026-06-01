const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validate');
const { orderSchema } = require('../schemas/order');
const validateObjectId = require('../middleware/validateObjectId');
const cartController = requireController('../controllers/cartController');

router.get('/', authenticate, cartController.getCart);
router.post('/', authenticate, validateRequest(orderSchema), cartController.createCart);
router.put('/:id', authenticate, validateObjectId('id'), validateRequest(orderSchema), cartController.updateCart);
router.delete('/:id', authenticate, validateObjectId('id'), cartController.deleteCart);

module.exports = router;
