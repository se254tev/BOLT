const express = require('express');
const { contactClick } = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/contact-click', authenticate, contactClick);

module.exports = router;
