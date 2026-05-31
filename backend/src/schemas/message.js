const { z } = require('zod');

const messageSchema = z.object({
  conversationId: z.string().min(1).optional(),
  senderId: z.string().min(1).optional(),
  recipientId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

module.exports = { messageSchema };
