const express = require('express');
const router = express.Router();
const { requireController } = require('../utils/requireController');
const { health, ready, redisStatus } = requireController('../controllers/healthController');
const requestId = require('../middleware/requestId');

router.get('/health', requestId, health);
router.get('/ready', requestId, ready);
router.get('/redis', requestId, redisStatus);

module.exports = router;
