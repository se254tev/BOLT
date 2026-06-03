const User = require('../models/user');
const Product = require('../models/product');
const Property = require('../models/property');
const Review = require('../models/review');
const Cart = require('../models/cart');
const AuditLog = require('../models/auditLog');

const getAnalytics = async () => {
  const [totalUsers, totalSellers, totalProducts, totalProperties, totalOrders, revenueResult] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    Product.countDocuments(),
    Property.countDocuments(),
    Cart.countDocuments(),
    Cart.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]),
  ]);

  const revenue = revenueResult.length ? revenueResult[0].revenue : 0;
  return {
    users: totalUsers,
    sellers: totalSellers,
    products: totalProducts,
    properties: totalProperties,
    orders: totalOrders,
    revenue,
  };
};

const moderateProduct = async ({ id, action }) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  if (action === 'approve') {
    product.verified = true;
    product.suspended = false;
    await product.save();
    return product;
  }
  if (action === 'reject') {
    product.verified = false;
    product.suspended = true;
    await product.save();
    return product;
  }
  if (action === 'delete') {
    await Product.deleteOne({ _id: id });
    return null;
  }
  throw new Error('Invalid action');
};

const moderateProperty = async ({ id, action }) => {
  const property = await Property.findById(id);
  if (!property) throw new Error('Property not found');
  if (action === 'approve') {
    property.isVerified = true;
    property.suspended = false;
    await property.save();
    return property;
  }
  if (action === 'reject') {
    property.isVerified = false;
    property.suspended = true;
    await property.save();
    return property;
  }
  if (action === 'delete') {
    await Property.deleteOne({ _id: id });
    return null;
  }
  throw new Error('Invalid action');
};

const deleteReview = async ({ id }) => {
  const review = await Review.findById(id);
  if (!review) throw new Error('Review not found');
  await Review.deleteOne({ _id: id });
  return true;
};

const manageUser = async ({ id, action }) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  if (action === 'suspend') {
    user.suspended = true;
  } else if (action === 'activate') {
    user.suspended = false;
  } else {
    throw new Error('Invalid action');
  }
  await user.save();
  const result = user.toObject();
  delete result.password;
  return result;
};

module.exports = { getAnalytics, moderateProduct, moderateProperty, deleteReview, manageUser };
