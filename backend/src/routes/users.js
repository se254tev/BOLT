const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validate');
const { userUpdateSchema } = require('../schemas/user');
const userController = requireController('../controllers/userController');

router.get('/', authenticate, authorize(['admin', 'super_admin']), userController.listUsers);
router.get('/agents/subscription', authenticate, userController.getAgentSubscription);
router.get('/:id', authenticate, validateObjectId('id'), userController.getUser);
router.get('/:id/payment-methods', authenticate, validateObjectId('id'), userController.getPaymentMethods);
router.put('/:id', authenticate, validateObjectId('id'), validateRequest(userUpdateSchema), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), validateObjectId('id'), userController.deleteUser);

module.exports = router;
