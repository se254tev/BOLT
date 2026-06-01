const DeliveryOrder = require('../models/deliveryOrder');
const FoodOrder = require('../models/foodOrder');
const Notification = require('../models/notification');
const PaymentAudit = require('../models/paymentAudit');

const findOrder = async (id) => {
  let order = await DeliveryOrder.findById(id);
  let type = 'delivery';
  if (!order) {
    order = await FoodOrder.findById(id);
    type = 'food';
  }
  return { order, type };
};

const submitPaymentProof = async ({ orderId, user, payload }) => {
  const { transactionCode, mpesaMessage, screenshotUrl } = payload;
  if (!transactionCode) throw new Error('transactionCode is required');
  if (!mpesaMessage && !screenshotUrl) throw new Error('Either mpesaMessage or screenshotUrl is required');

  const { order, type } = await findOrder(orderId);
  if (!order) throw new Error('Order not found');

  // Only buyer may submit proof
  if (String(order.buyerId) !== String(user.id)) throw new Error('Only buyer may submit payment proof');

  order.payment = order.payment || {};
  order.payment.transactionCode = transactionCode;
  order.payment.mpesaMessage = mpesaMessage;
  order.payment.screenshotUrl = screenshotUrl;
  order.payment.submittedAt = new Date();
  order.paymentStatus = 'AWAITING_SELLER_CONFIRMATION';

  await order.save();

  // Notify seller
  const sellerId = order.sellerId || order.restaurantId;
  if (sellerId) {
    await Notification.create({ userId: sellerId, title: `Payment proof submitted for Order ${orderId}`, body: `A buyer submitted payment proof for order ${orderId}.` });
  }

  await PaymentAudit.create({ action: 'payment_submitted', actor: user.id, actorRole: user.role, orderId, details: { transactionCode } });

  return order;
};

const approvePayment = async ({ orderId, user, payload }) => {
  const { approvedPaymentReference } = payload || {};
  if (!approvedPaymentReference) throw new Error('approvedPaymentReference is required');

  const { order } = await findOrder(orderId);
  if (!order) throw new Error('Order not found');

  // Seller check
  if (String(order.sellerId) !== String(user.id) && String(order.restaurantId) !== String(user.id)) throw new Error('Only seller may approve payment');

  order.payment = order.payment || {};
  order.payment.approvedAt = new Date();
  order.payment.approvedBy = user.id;
  order.payment.approvedPaymentReference = approvedPaymentReference;
  order.paymentStatus = 'PAID';

  if (order.status && ['created', 'payment_pending', 'PENDING', 'AWAITING_PAYMENT', 'AWAITING_SELLER_CONFIRMATION'].includes(order.status)) {
    order.status = 'processing';
  }

  await order.save();

  // Notify buyer
  await Notification.create({ userId: order.buyerId, title: `Payment approved for Order ${orderId}`, body: 'Payment approved. Order is now processing.' });

  await PaymentAudit.create({
    action: 'payment_approved',
    actor: user.id,
    actorRole: user.role,
    orderId,
    reason: 'Seller approved payment',
    metadata: { approvedPaymentReference },
  });

  return order;
};

const rejectPayment = async ({ orderId, user, rejectionReason }) => {
  const { order } = await findOrder(orderId);
  if (!order) throw new Error('Order not found');

  if (String(order.sellerId) !== String(user.id) && String(order.restaurantId) !== String(user.id)) throw new Error('Only seller may reject payment');
  if (!rejectionReason) throw new Error('rejectionReason is required');

  order.payment = order.payment || {};
  order.payment.rejectionReason = rejectionReason;
  order.paymentStatus = 'PAYMENT_REJECTED';

  await order.save();

  // Notify buyer
  await Notification.create({ userId: order.buyerId, title: `Payment rejected for Order ${orderId}`, body: 'Payment rejected. Please resubmit proof.' });

  await PaymentAudit.create({
    action: 'payment_rejected',
    actor: user.id,
    actorRole: user.role,
    orderId,
    reason: rejectionReason,
    metadata: { rejectionReason },
  });

  return order;
};

module.exports = { submitPaymentProof, approvePayment, rejectPayment };
