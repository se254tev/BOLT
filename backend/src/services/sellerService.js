const mongoose = require('mongoose');
const Product = require('../models/product');
const Property = require('../models/property');
const Review = require('../models/review');
const DeliveryOrder = require('../models/deliveryOrder');

const getSellerDashboard = async (sellerId) => {
  const sellerObjectId = mongoose.Types.ObjectId(sellerId);

  const [totalProducts, totalProperties, pendingListings, verifiedListings, reviewCountResult, orderMetrics] = await Promise.all([
    Product.countDocuments({ sellerId: sellerObjectId, suspended: { $ne: true } }),
    Property.countDocuments({ agentId: sellerObjectId, suspended: { $ne: true } }),
    Product.countDocuments({ sellerId: sellerObjectId, verified: false, suspended: { $ne: true } }),
    Product.countDocuments({ sellerId: sellerObjectId, verified: true, suspended: { $ne: true } }),
    Review.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { 'product.sellerId': sellerObjectId } },
      { $count: 'count' },
    ]),
    DeliveryOrder.aggregate([
      { $match: { sellerId: sellerObjectId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$payment.amount', 0] } },
        },
      },
    ]),
  ]);

  const totalReviews = reviewCountResult.length > 0 ? reviewCountResult[0].count : 0;
  const totalOrders = orderMetrics.length > 0 ? orderMetrics[0].count : 0;
  const revenue = orderMetrics.length > 0 ? orderMetrics[0].revenue : 0;

  return {
    totalProducts,
    totalProperties,
    pendingListings,
    verifiedListings,
    totalReviews,
    totalOrders,
    revenue,
  };
};

module.exports = { getSellerDashboard };
