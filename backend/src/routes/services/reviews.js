const express = require('express');
const validateRequest = require('../../middleware/validate');
const { serviceReviewCreateSchema } = require('../../schemas/services');
const reviewsController = require('../../controllers/serviceReviewsController');

const router = express.Router();

router.post('/create', validateRequest(serviceReviewCreateSchema), reviewsController.createReview);

module.exports = router;
