const { z } = require('zod');

const orderSchema = z.object({
  userId: z.string().min(1).optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    price: z.number().nonnegative().optional(),
  })).min(1),
  total: z.number().nonnegative().optional(),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
});

module.exports = { orderSchema };
