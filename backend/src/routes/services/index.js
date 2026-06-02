const express = require('express');
const requestsRoutes = require('./requests');
const bidsRoutes = require('./bids');
const workersRoutes = require('./workers');
const reviewsRoutes = require('./reviews');

const router = express.Router();

router.use('/requests', requestsRoutes);
router.use('/bids', bidsRoutes);
router.use('/workers', workersRoutes);
router.use('/reviews', reviewsRoutes);

module.exports = router;
