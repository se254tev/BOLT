const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validate');
const { messageSchema } = require('../schemas/message');
const validateObjectId = require('../middleware/validateObjectId');
const chatController = require('../controllers/chatController');

router.get('/', authenticate, chatController.listConversations);
router.get('/:id/messages', authenticate, validateObjectId('id'), chatController.getMessages);
router.post('/:id/messages', authenticate, validateObjectId('id'), validateRequest(messageSchema), chatController.sendMessage);

module.exports = router;
