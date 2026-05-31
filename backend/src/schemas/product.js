const { z } = require('zod');

const productSchema = z.object({
  sellerId: z.string().min(1).optional(),
  name: z.string().min(2).max(150),
  description: z.string().min(5).max(2000),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  images: z.array(z.string().url()).max(10),
  verified: z.boolean().optional(),
});

module.exports = { productSchema };
