const express = require('express');
const router = express.Router();
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const { generalLimiter, sellerLimiter } = require('../middleware/rateLimit');
const validateRequest = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { restaurantSchema } = require('../schemas/restaurant');
const foodController = require('../controllers/foodController');

router.use(sanitize.sanitizeMiddleware);
router.use(generalLimiter);

router.post('/', authenticate, sellerLimiter, validateRequest(restaurantSchema), foodController.createRestaurant);
router.get('/', authenticate, foodController.listRestaurants);
router.get('/:id', authenticate, validateObjectId('id'), foodController.getRestaurant);

module.exports = router;
