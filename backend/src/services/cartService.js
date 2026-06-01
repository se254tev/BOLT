const Cart = require('../models/cart');
const AuditLog = require('../models/auditLog');

const getCartForUser = async (userId) => Cart.findOne({ userId }).populate('items.productId').lean();

const calculateTotal = (items, totalOverride) => {
  if (typeof totalOverride === 'number') return totalOverride;
  return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
};

const createCart = async ({ user, payload }) => {
  const total = calculateTotal(payload.items || [], payload.total);
  const cart = await Cart.create({ ...payload, userId: user.id, total });
  await AuditLog.create({ adminId: user.id, action: 'create_cart', resource: 'cart', resourceId: cart.id });
  return cart;
};

const updateCart = async ({ id, user, payload }) => {
  const cart = await Cart.findById(id);
  if (!cart) throw new Error('Cart not found');
  if (cart.userId.toString() !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  if (payload.items) {
    payload.total = calculateTotal(payload.items, payload.total);
  }
  Object.assign(cart, payload);
  await cart.save();
  await AuditLog.create({ adminId: user.id, action: 'update_cart', resource: 'cart', resourceId: id });
  return cart;
};

const deleteCart = async ({ id, user }) => {
  const cart = await Cart.findById(id);
  if (!cart) throw new Error('Cart not found');
  if (cart.userId.toString() !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  await Cart.deleteOne({ _id: id });
  await AuditLog.create({ adminId: user.id, action: 'delete_cart', resource: 'cart', resourceId: id });
  return true;
};

module.exports = { getCartForUser, createCart, updateCart, deleteCart };
