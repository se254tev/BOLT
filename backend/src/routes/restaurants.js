const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const { generalLimiter, sellerLimiter } = require('../middleware/rateLimit');
const validateRequest = require('../middleware/validate');
const authorizeSeller = require('../middleware/authorizeSeller');
const validateObjectId = require('../middleware/validateObjectId');
const { restaurantSchema } = require('../schemas/restaurant');
const foodController = requireController('../controllers/foodController');

router.use(sanitize.sanitizeMiddleware);
router.use(generalLimiter);

router.post('/', authenticate, authorizeSeller(), sellerLimiter, validateRequest(restaurantSchema), foodController.createRestaurant);
router.get('/', authenticate, foodController.listRestaurants);
router.get('/:id', authenticate, validateObjectId('id'), foodController.getRestaurant);

module.exports = router;
