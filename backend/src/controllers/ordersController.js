const paymentService = require('../services/paymentService');

const submitPaymentProof = async (req, res) => {
  try {
    const order = await paymentService.submitPaymentProof({ orderId: req.params.id, user: req.user, payload: req.body });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const approvePayment = async (req, res) => {
  try {
    const order = await paymentService.approvePayment({ orderId: req.params.id, user: req.user });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const order = await paymentService.rejectPayment({ orderId: req.params.id, user: req.user, rejectionReason });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listPendingForSeller = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const DeliveryOrder = require('../models/deliveryOrder');
    const FoodOrder = require('../models/foodOrder');
    const delivery = await DeliveryOrder.find({ sellerId, paymentStatus: 'AWAITING_SELLER_CONFIRMATION' }).lean();
    const food = await FoodOrder.find({ restaurantId: sellerId, paymentStatus: 'AWAITING_SELLER_CONFIRMATION' }).lean();
    res.json({ orders: [...delivery, ...food] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { submitPaymentProof, approvePayment, rejectPayment };
