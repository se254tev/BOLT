const express = require('express');
const validateRequest = require('../../middleware/validate');
const validateObjectId = require('../../middleware/validateObjectId');
const { serviceBidCreateSchema, serviceBidSelectSchema } = require('../../schemas/services');
const bidsController = require('../../controllers/serviceBidsController');

const router = express.Router();

router.post('/create', validateRequest(serviceBidCreateSchema), bidsController.createBid);
router.post('/select', validateRequest(serviceBidSelectSchema), bidsController.selectBid);
router.get('/request/:id', validateObjectId('id'), bidsController.listBidsForRequest);

module.exports = router;
