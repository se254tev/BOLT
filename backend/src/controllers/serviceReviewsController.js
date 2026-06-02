const requestService = require('../services/requests/request.service');

const createReview = async (req, res) => {
  const review = await requestService.createReview({ user: req.user, payload: req.validated });
  res.json({ review });
};

module.exports = {
  createReview,
};
