const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const { health, ready } = requireController('../controllers/healthController');
const requestId = require('../middleware/requestId');

router.get('/health', requestId, health);
router.get('/ready', requestId, ready);

module.exports = router;
