const adminPaymentService = require('../services/adminPaymentService');
const PaymentAudit = require('../models/paymentAudit');

const listPayments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;
    const data = await adminPaymentService.listPaymentRecords({ status, search, page, limit });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const data = await adminPaymentService.getPaymentDetail(req.params.id);
    if (!data) return res.status(404).json({ error: 'Payment record not found' });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const approvePayment = async (req, res) => {
  try {
    const { approvedPaymentReference, reason } = req.body;
    const order = await adminPaymentService.updateOrderStatus({ orderId: req.params.id, user: req.user, action: 'approve', payload: { approvedPaymentReference, reason } });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rejectPayment = async (req, res) => {
  try {
    const { rejectionReason, reason } = req.body;
    const order = await adminPaymentService.updateOrderStatus({ orderId: req.params.id, user: req.user, action: 'reject', payload: { rejectionReason, reason } });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const overridePayment = async (req, res) => {
  try {
    const { action, reason, approvedPaymentReference, rejectionReason } = req.body;
    if (!['approve', 'reject'].includes(action)) throw new Error('Override action must be approve or reject');
    const payload = { reason, approvedPaymentReference, rejectionReason };
    const order = await adminPaymentService.updateOrderStatus({ orderId: req.params.id, user: req.user, action, payload });
    await PaymentAudit.create({
      action: 'admin_override',
      actor: req.user.id,
      actorRole: req.user.role,
      orderId: req.params.id,
      reason: reason || `${action} override`,
      metadata: { action, approvedPaymentReference, rejectionReason },
    });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const suspendSeller = async (req, res) => {
  try {
    const reason = req.body.reason || 'Suspended by admin due to payment concerns';
    const target = await adminPaymentService.suspendSellerForOrder({ orderId: req.params.id, user: req.user, reason });
    res.json({ target });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listPayments,
  getPayment,
  approvePayment,
  rejectPayment,
  overridePayment,
  suspendSeller,
};
