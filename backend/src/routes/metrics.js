const express = require('express');
const router = express.Router();
const { register } = require('../services/metricsService');

router.get('/', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = router;
