const Review = require('../models/review');
const AuditLog = require('../models/auditLog');

const listReviews = async ({ productId } = {}) => {
  const filter = {};
  if (productId) filter.productId = productId;
  return Review.find(filter).populate('userId', 'name email').populate('productId', 'name category').lean();
};

const createReview = async ({ user, payload }) => {
  const review = await Review.create({
    productId: payload.productId,
    userId: user.id,
    rating: payload.rating,
    comment: payload.comment,
  });
  await AuditLog.create({ adminId: user.id, action: 'create_review', resource: 'review', resourceId: review.id });
  return review;
};

const updateReview = async ({ id, user, payload }) => {
  const review = await Review.findById(id);
  if (!review) throw new Error('Review not found');
  if (review.userId.toString() !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  review.rating = payload.rating;
  review.comment = payload.comment;
  await review.save();
  await AuditLog.create({ adminId: user.id, action: 'update_review', resource: 'review', resourceId: id });
  return review;
};

const deleteReview = async ({ id, user }) => {
  const review = await Review.findById(id);
  if (!review) throw new Error('Review not found');
  if (review.userId.toString() !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  await Review.deleteOne({ _id: id });
  await AuditLog.create({ adminId: user.id, action: 'delete_review', resource: 'review', resourceId: id });
  return true;
};

module.exports = { listReviews, createReview, updateReview, deleteReview };
