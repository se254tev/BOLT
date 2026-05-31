const express = require('express');
const router = express.Router();

router.get('/analytics', (req, res) => res.json({ totalProducts: 120, totalProperties: 58, pendingListings: 12, verifiedListings: 166, totalReviews: 484 }));
router.put('/products/:id/verify', (req, res) => res.json({ success: true }));
router.put('/properties/:id/verify', (req, res) => res.json({ success: true }));
router.get('/users', (req, res) => res.json({ users: [] }));

module.exports = router;
