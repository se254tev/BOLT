const express = require('express');
const validateRequest = require('../../middleware/validate');
const { serviceWorkerRegisterSchema } = require('../../schemas/services');
const workersController = require('../../controllers/serviceWorkersController');

const router = express.Router();

router.post('/register', validateRequest(serviceWorkerRegisterSchema), workersController.registerWorker);
router.get('/available', workersController.listAvailableWorkers);

module.exports = router;
