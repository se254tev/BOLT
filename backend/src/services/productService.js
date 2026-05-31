const Product = require('../models/product');
const AuditLog = require('../models/auditLog');

const listProducts = async ({ search, category, sellerId, verified }) => {
  const filter = { suspended: { $ne: true } };
  if (search) filter.name = new RegExp(search, 'i');
  if (category) filter.category = category;
  if (sellerId) filter.sellerId = sellerId;
  if (verified === 'true') filter.verified = true;
  return Product.find(filter).lean();
};

const getProduct = async (id) => Product.findById(id);

const createProduct = async ({ user, payload }) => {
  const product = await Product.create({ ...payload, sellerId: user.id, verified: false });
  await AuditLog.create({ adminId: user.id, action: 'create_product', resource: 'product', resourceId: product.id });
  return product;
};

const updateProduct = async ({ id, user, payload }) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  if (product.sellerId.toString() !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  const sanitized = { ...payload };
  delete sanitized.sellerId;
  Object.assign(product, sanitized);
  await product.save();
  await AuditLog.create({ adminId: user.id, action: 'update_product', resource: 'product', resourceId: id });
  return product;
};

const deleteProduct = async ({ id, user }) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  if (product.sellerId.toString() !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  await Product.deleteOne({ _id: id });
  await AuditLog.create({ adminId: user.id, action: 'delete_product', resource: 'product', resourceId: id });
  return true;
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
