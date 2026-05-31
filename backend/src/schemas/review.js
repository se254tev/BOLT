const { z } = require('zod');

const reviewSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

module.exports = { reviewSchema };
