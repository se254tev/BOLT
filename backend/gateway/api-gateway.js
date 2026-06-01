const express = require('express');
const authRoutes = require('../src/routes/auth');
const adminAuthRoutes = require('../src/routes/adminAuth');
const productsRoutes = require('../src/routes/products');
const propertiesRoutes = require('../src/routes/properties');
const cartRoutes = require('../src/routes/cart');
const favoritesRoutes = require('../src/routes/favorites');
const reviewsRoutes = require('../src/routes/reviews');
const chatRoutes = require('../src/routes/chat');
const usersRoutes = require('../src/routes/users');
const restaurantsRoutes = require('../src/routes/restaurants');
const mealsRoutes = require('../src/routes/meals');
const foodOrdersRoutes = require('../src/routes/foodOrders');
const adminRoutes = require('../src/routes/admin');
const uploadsRoutes = require('../src/routes/uploads');
const healthRoutes = require('../src/routes/health');
const deliveryRoutes = require('../src/routes/delivery');
const authenticate = require('../src/middleware/authenticate');
const authenticateAdmin = require('../src/middleware/authenticateAdmin');
const authorizeAdmin = require('../src/middleware/authorizeAdmin');
const { adminLimiter } = require('../src/middleware/rateLimit');
const { responseFormatter } = require('../src/middleware/responseFormatter');
const { auditMiddleware } = require('../src/middleware/audit');
const ERRORS = require('../src/constants/errorCodes');
const { createError } = require('../src/utils/appError');
const { errorResponse } = require('../src/utils/apiResponse');

const router = express.Router();

router.use(responseFormatter);
router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);

router.use(authenticate);

router.use('/products', productsRoutes);
router.use('/properties', propertiesRoutes);
router.use('/restaurants', restaurantsRoutes);
router.use('/meals', mealsRoutes);
router.use('/food-orders', foodOrdersRoutes);
router.use('/cart', cartRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/chat', chatRoutes);
router.use('/users', usersRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/uploads', uploadsRoutes);

router.use('/admin', authenticateAdmin, authorizeAdmin(), adminLimiter, auditMiddleware, adminRoutes);

router.use('/health', healthRoutes);

router.use((req, res) => {
  const error = createError(ERRORS.ENDPOINT_NOT_FOUND);
  errorResponse(res, error);
});

module.exports = router;
