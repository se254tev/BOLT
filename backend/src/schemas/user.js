const { z } = require('zod');

const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  profileImage: z.string().url().optional(),
  role: z.enum(['buyer', 'seller', 'admin', 'super_admin']).optional(),
  suspended: z.boolean().optional(),
});

module.exports = { userUpdateSchema };
