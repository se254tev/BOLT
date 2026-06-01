const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const ordersController = require('../controllers/ordersController');

// Buyer submits payment proof
router.post('/:id/payment-proof', authenticate, validateObjectId('id'), ordersController.submitPaymentProof);

// Seller approves payment
router.post('/:id/approve-payment', authenticate, validateObjectId('id'), ordersController.approvePayment);

// Seller rejects payment
router.post('/:id/reject-payment', authenticate, validateObjectId('id'), ordersController.rejectPayment);

// Seller: list pending payment proofs awaiting confirmation
router.get('/seller/pending', authenticate, ordersController.listPendingForSeller);

module.exports = router;
