const Conversation = require('../models/conversation');
const AuditLog = require('../models/auditLog');

const listConversations = async (userId) => Conversation.find({ participants: userId })
  .populate('participants', 'name email')
  .lean();

const getConversation = async (id, userId) => Conversation.findOne({ _id: id, participants: userId })
  .populate('participants', 'name email')
  .lean();

const addMessage = async ({ conversationId, userId, recipientId, content }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error('Conversation not found');
  if (!conversation.participants.some((participant) => participant.toString() === userId)) {
    throw new Error('Unauthorized');
  }

  const message = { senderId: userId, recipientId, content };
  conversation.messages.push(message);
  if (!conversation.participants.some((participant) => participant.toString() === recipientId)) {
    conversation.participants.push(recipientId);
  }
  await conversation.save();
  await AuditLog.create({ adminId: userId, action: 'send_chat_message', resource: 'conversation', resourceId: conversationId });
  return conversation;
};

module.exports = { listConversations, getConversation, addMessage };
