const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const { generalLimiter, sellerLimiter } = require('../middleware/rateLimit');
const validateRequest = require('../middleware/validate');
const { propertySchema } = require('../schemas/property');
const validateObjectId = require('../middleware/validateObjectId');
const authorizeSeller = require('../middleware/authorizeSeller');
const monetize = requireController('../controllers/monetizationController');

router.use(sanitize.sanitizeMiddleware);
router.use(generalLimiter);

router.get('/', authenticate, monetize.listProperties);
router.get('/featured', authenticate, monetize.getFeatured);
router.get('/:id', authenticate, validateObjectId('id'), monetize.getProperty);
router.post('/', authenticate, authorizeSeller(), sellerLimiter, validateRequest(propertySchema), monetize.createProperty);
router.post('/:id/boost', authenticate, validateObjectId('id'), monetize.boostProperty);
router.post('/:id/inquiry', authenticate, validateObjectId('id'), monetize.incrementInquiry);
router.put('/:id', authenticate, authorizeSeller(), sellerLimiter, validateObjectId('id'), validateRequest(propertySchema), monetize.updateProperty);
router.delete('/:id', authenticate, authorizeSeller(), sellerLimiter, validateObjectId('id'), monetize.deleteProperty);

module.exports = router;
