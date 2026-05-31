const chatService = require('../services/chatService');

const listConversations = async (req, res) => {
  const conversations = await chatService.listConversations(req.user.id);
  res.json({ conversations });
};

const getMessages = async (req, res) => {
  try {
    const conversation = await chatService.getConversation(req.params.id, req.user.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ messages: conversation.messages || [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const payload = req.validated || req.body;
    const conversation = await chatService.addMessage({
      conversationId: req.params.id,
      userId: req.user.id,
      recipientId: payload.recipientId,
      content: payload.content,
    });
    res.status(201).json({ conversation });
  } catch (err) {
    res.status(err.message === 'Conversation not found' ? 404 : 403).json({ error: err.message });
  }
};

module.exports = { listConversations, getMessages, sendMessage };
