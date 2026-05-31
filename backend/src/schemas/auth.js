const { z } = require('zod');

const emailSchema = z.string().email({ message: 'Invalid email address.' });
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long.');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().min(7).max(20),
  role: z.enum(['buyer', 'seller']).default('buyer'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const refreshSchema = z.object({});
const emailSchemaOnly = z.object({ email: emailSchema });
const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
const verifyEmailSchema = z.object({ token: z.string().min(1) });

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  emailSchemaOnly,
  resetPasswordSchema,
  verifyEmailSchema,
};