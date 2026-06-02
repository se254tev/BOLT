const express = require('express');
const validateRequest = require('../../middleware/validate');
const validateObjectId = require('../../middleware/validateObjectId');
const { serviceRequestCreateSchema } = require('../../schemas/services');
const requestsController = require('../../controllers/serviceRequestsController');

const router = express.Router();

router.post('/create', validateRequest(serviceRequestCreateSchema), requestsController.createRequest);
router.get('/user/:id', validateObjectId('id'), requestsController.getUserRequests);
router.get('/:id', validateObjectId('id'), requestsController.getRequest);

module.exports = router;
