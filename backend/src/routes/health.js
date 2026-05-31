const express = require('express');
const router = express.Router();
const { health, ready } = require('../controllers/healthController');
const requestId = require('../middleware/requestId');

router.get('/health', requestId, health);
router.get('/ready', requestId, ready);

module.exports = router;
