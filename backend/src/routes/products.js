const express = require('express');
const router = express.Router();
const sanitize = require('../middleware/sanitize');
const authenticate = require('../middleware/authenticate');
const { generalLimiter, sellerLimiter } = require('../middleware/rateLimit');
const validateRequest = require('../middleware/validate');
const { productSchema } = require('../schemas/product');
const validateObjectId = require('../middleware/validateObjectId');
const productController = require('../controllers/productController');

router.use(sanitize.sanitizeMiddleware);
router.use(generalLimiter);

router.get('/', authenticate, productController.listProducts);
router.get('/:id', authenticate, validateObjectId('id'), productController.getProduct);
router.post('/', authenticate, sellerLimiter, validateRequest(productSchema), productController.createProduct);
router.put('/:id', authenticate, sellerLimiter, validateObjectId('id'), validateRequest(productSchema), productController.updateProduct);
router.delete('/:id', authenticate, sellerLimiter, validateObjectId('id'), productController.deleteProduct);

module.exports = router;
