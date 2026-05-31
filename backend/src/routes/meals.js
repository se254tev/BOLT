const express = require('express');
const router = express.Router();
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const { generalLimiter, sellerLimiter } = require('../middleware/rateLimit');
const validateRequest = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { mealSchema } = require('../schemas/meal');
const foodController = require('../controllers/foodController');

router.use(sanitize.sanitizeMiddleware);
router.use(generalLimiter);

router.get('/', authenticate, foodController.listMeals);
router.get('/:id', authenticate, validateObjectId('id'), foodController.getMeal);
router.post('/', authenticate, sellerLimiter, validateRequest(mealSchema), foodController.createMeal);
router.delete('/:id', authenticate, validateObjectId('id'), foodController.removeMealListing);

module.exports = router;
