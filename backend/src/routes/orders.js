const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validate');
const { orderSchema } = require('../schemas/order');
const ordersController = require('../controllers/ordersController');
console.log('ordersController:', ordersController);
const authorizeSeller = require('../middleware/authorizeSeller');

// Buyer submits payment proof
router.post('/:id/payment-proof', authenticate, validateObjectId('id'), ordersController.submitPaymentProof);

// Create a new order from buyer
router.post('/', authenticate, validateRequest(orderSchema), ordersController.createOrder);

// Seller approves payment
router.post('/:id/approve-payment', authenticate, authorizeSeller(), validateObjectId('id'), ordersController.approvePayment);

// Seller rejects payment
router.post('/:id/reject-payment', authenticate, authorizeSeller(), validateObjectId('id'), ordersController.rejectPayment);

// Seller: list pending payment proofs awaiting confirmation
router.get('/seller/pending', authenticate, authorizeSeller(), ordersController.listPendingForSeller);

module.exports = router;
