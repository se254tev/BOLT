const Order = require('../models/order');
const Cart = require('../models/cart');
const AuditLog = require('../models/auditLog');

const calculateTotal = (items, totalOverride) => {
  if (typeof totalOverride === 'number') return totalOverride;
  return items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
};

const createOrder = async ({ user, payload }) => {
  // payload: { items: [{ productId, quantity, price }], total? }
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('No items in order');
  }

  const total = calculateTotal(payload.items, payload.total);

  // derive sellerIds from items if available (best-effort)
  const sellerIds = [];
  // if items include sellerId, collect unique; otherwise leave empty
  payload.items.forEach((it) => {
    if (it.sellerId) {
      const s = String(it.sellerId);
      if (!sellerIds.includes(s)) sellerIds.push(s);
    }
  });

  const order = await Order.create({
    buyerId: user.id,
    items: payload.items,
    total,
    paymentStatus: payload.paymentStatus || 'PENDING',
    status: 'created',
    sellerIds,
  });

  await AuditLog.create({ adminId: user.id, action: 'create_order', resource: 'order', resourceId: order.id });

  // Optionally clear user's cart (leave to controller/remote caller to clear client-side cart)
  try {
    await Cart.deleteOne({ userId: user.id });
  } catch (e) {
    // non-fatal
  }

  return order;
};

module.exports = { createOrder };
