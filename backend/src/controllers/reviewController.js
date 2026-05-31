const reviewService = require('../services/reviewService');

const listReviews = async (req, res) => {
  const reviews = await reviewService.listReviews({ productId: req.query.productId });
  res.json({ reviews });
};

const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview({ user: req.user, payload: req.validated || req.body });
    res.status(201).json({ review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview({ id: req.params.id, user: req.user, payload: req.validated || req.body });
    res.json({ review });
  } catch (err) {
    res.status(err.message === 'Review not found' ? 404 : 403).json({ error: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview({ id: req.params.id, user: req.user });
    res.status(204).send();
  } catch (err) {
    res.status(err.message === 'Review not found' ? 404 : 403).json({ error: err.message });
  }
};

module.exports = { listReviews, createReview, updateReview, deleteReview };
