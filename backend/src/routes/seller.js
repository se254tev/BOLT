const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { requireController } = require('../utils/requireController');
const sellerController = requireController('../controllers/sellerController');
const authorizeSeller = require('../middleware/authorizeSeller');
const analyticsController = require('../controllers/analyticsController');

router.post('/apply', authenticate, sellerController.applySeller);
router.patch('/activate', authenticate, sellerController.activateSeller);
router.get('/dashboard', authenticate, authorizeSeller(), sellerController.getDashboard);
router.get('/analytics', authenticate, authorizeSeller(), analyticsController.sellerAnalytics);

module.exports = router;
