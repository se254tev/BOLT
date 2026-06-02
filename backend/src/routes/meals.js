const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const { generalLimiter, sellerLimiter } = require('../middleware/rateLimit');
const validateRequest = require('../middleware/validate');
const authorizeSeller = require('../middleware/authorizeSeller');
const validateObjectId = require('../middleware/validateObjectId');
const { mealSchema } = require('../schemas/meal');
const foodController = requireController('../controllers/foodController');

router.use(sanitize.sanitizeMiddleware);
router.use(generalLimiter);

router.get('/', authenticate, foodController.listMeals);
router.get('/:id', authenticate, validateObjectId('id'), foodController.getMeal);
router.post('/', authenticate, authorizeSeller(), sellerLimiter, validateRequest(mealSchema), foodController.createMeal);
router.delete('/:id', authenticate, authorizeSeller(), validateObjectId('id'), foodController.removeMealListing);

module.exports = router;
