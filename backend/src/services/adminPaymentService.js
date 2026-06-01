const DeliveryOrder = require('../models/deliveryOrder');
const FoodOrder = require('../models/foodOrder');
const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const Notification = require('../models/notification');
const PaymentAudit = require('../models/paymentAudit');

const findOrder = async (id, { lean = false } = {}) => {
  let query = DeliveryOrder.findById(id)
    .populate('buyerId', 'name email phone')
    .populate('sellerId', 'name email phone');
  if (lean) query = query.lean();
  let order = await query;
  if (order) return { order, type: 'delivery' };

  query = FoodOrder.findById(id)
    .populate('buyerId', 'name email phone')
    .populate('restaurantId', 'name ownerId');
  if (lean) query = query.lean();
  order = await query;
  if (order) return { order, type: 'food' };

  return { order: null, type: null };
};

const formatSellerInfo = (order, type) => {
  if (type === 'delivery') {
    const seller = order.sellerId;
    return seller ? `${seller.name || ''} ${seller.email || ''}`.trim() : 'Seller';
  }

  if (type === 'food') {
    const restaurant = order.restaurantId;
    return restaurant ? restaurant.name || 'Restaurant' : 'Restaurant';
  }

  return 'Seller';
};

const formatBuyerInfo = (order) => {
  const buyer = order.buyerId;
  return buyer ? `${buyer.name || ''} ${buyer.email || ''}`.trim() : 'Buyer';
};

const buildPaymentRecord = (order, type) => ({
  orderId: order._id,
  type,
  buyer: formatBuyerInfo(order),
  seller: formatSellerInfo(order, type),
  amount: order.totalAmount ?? order.fee ?? 0,
  status: order.paymentStatus,
  transactionCode: order.payment?.transactionCode,
  submittedAt: order.payment?.submittedAt,
  approvedAt: order.payment?.approvedAt,
  screenshotUrl: order.payment?.screenshotUrl,
  payment: order.payment || {},
});

const matchesSearch = (record, search) => {
  if (!search) return true;
  const normalized = String(search).toLowerCase();
  return [
    record.orderId,
    record.buyer,
    record.seller,
    record.transactionCode,
    record.status,
  ].some((value) => String(value || '').toLowerCase().includes(normalized));
};

const listPaymentRecords = async ({ status, search, page = 1, limit = 20 }) => {
  const query = {};
  if (status) query.paymentStatus = status;

  const [deliveryOrders, foodOrders] = await Promise.all([
    DeliveryOrder.find(query)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .lean(),
    FoodOrder.find(query)
      .populate('buyerId', 'name email phone')
      .populate('restaurantId', 'name')
      .lean(),
  ]);

  const records = [
    ...deliveryOrders.map((order) => buildPaymentRecord(order, 'delivery')),
    ...foodOrders.map((order) => buildPaymentRecord(order, 'food')),
  ].filter((record) => matchesSearch(record, search));

  const sorted = records.sort((a, b) => {
    const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return bDate - aDate;
  });

  const total = sorted.length;
  const offset = (page - 1) * limit;
  const paged = sorted.slice(offset, offset + limit);

  return { total, page, limit, payments: paged };
};

const getPaymentDetail = async (orderId) => {
  const { order, type } = await findOrder(orderId, { lean: true });
  if (!order) return null;
  const auditTrail = await PaymentAudit.find({ orderId }).sort({ timestamp: -1 }).lean();
  return { order: buildPaymentRecord(order, type), auditTrail };
};

const updateOrderStatus = async ({ orderId, user, action, payload }) => {
  const { order, type } = await findOrder(orderId, { lean: false });
  if (!order) throw new Error('Order not found');

  const approvedPaymentReference = payload?.approvedPaymentReference;
  const rejectionReason = payload?.rejectionReason;
  const overrideReason = payload?.reason;
  const metadata = { ...payload };
  if (action === 'approve') {
    if (!approvedPaymentReference) throw new Error('approvedPaymentReference is required');
    order.payment = order.payment || {};
    order.payment.approvedAt = new Date();
    order.payment.approvedBy = user.id;
    order.payment.approvedPaymentReference = approvedPaymentReference;
    order.paymentStatus = 'PAID';
    if (order.status && ['created', 'payment_pending', 'PENDING', 'AWAITING_PAYMENT', 'AWAITING_SELLER_CONFIRMATION'].includes(order.status)) {
      order.status = 'processing';
    }
    await order.save();
    await Notification.create({ userId: order.buyerId, title: `Admin approved payment for Order ${orderId}`, body: 'An admin approved your payment proof.' });
    await PaymentAudit.create({ action: 'admin_approved', actor: user.id, actorRole: user.role, orderId, reason: overrideReason || 'Admin approved payment', metadata });
    return order;
  }

  if (action === 'reject') {
    if (!rejectionReason) throw new Error('rejectionReason is required');
    order.payment = order.payment || {};
    order.payment.rejectionReason = rejectionReason;
    order.paymentStatus = 'PAYMENT_REJECTED';
    await order.save();
    await Notification.create({ userId: order.buyerId, title: `Admin rejected payment for Order ${orderId}`, body: 'An admin rejected the payment proof. Please resubmit.' });
    await PaymentAudit.create({ action: 'admin_rejected', actor: user.id, actorRole: user.role, orderId, reason: rejectionReason, metadata });
    return order;
  }

  throw new Error('Unknown admin payment action');
};

const suspendSellerForOrder = async ({ orderId, user, reason }) => {
  const { order, type } = await findOrder(orderId);
  if (!order) throw new Error('Order not found');

  let target = null;
  let resource = null;
  if (type === 'delivery') {
    target = await User.findById(order.sellerId);
    resource = 'seller';
    if (!target) throw new Error('Seller not found');
    target.suspended = true;
    target.status = 'offline';
    await target.save();
  } else if (type === 'food') {
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');
    restaurant.suspended = true;
    await restaurant.save();
    const owner = await User.findById(restaurant.ownerId);
    if (owner) {
      owner.suspended = true;
      owner.status = 'offline';
      await owner.save();
    }
    target = restaurant;
    resource = 'restaurant';
  }

  await PaymentAudit.create({ action: 'seller_suspended', actor: user.id, actorRole: user.role, orderId, reason: reason || 'Suspended seller due to payment issue', metadata: { resource, orderType: type } });
  return target;
};

module.exports = {
  listPaymentRecords,
  getPaymentDetail,
  updateOrderStatus,
  suspendSellerForOrder,
};
