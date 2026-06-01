const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validate');
const { reviewSchema } = require('../schemas/review');
const validateObjectId = require('../middleware/validateObjectId');
const reviewController = requireController('../controllers/reviewController');

router.get('/', authenticate, reviewController.listReviews);
router.post('/', authenticate, validateRequest(reviewSchema), reviewController.createReview);
router.put('/:id', authenticate, validateObjectId('id'), validateRequest(reviewSchema), reviewController.updateReview);
router.delete('/:id', authenticate, validateObjectId('id'), reviewController.deleteReview);

module.exports = router;
