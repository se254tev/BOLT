const { z } = require('zod');

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'supper', 'dinner', 'snacks', 'drinks'];

const mealSchema = z.object({
  name: z.string().min(2).max(200),
  price: z.number().nonnegative(),
  description: z.string().max(2000).optional(),
  image: z.string().url().optional(),
  category: z.enum(MEAL_CATEGORIES),
  restaurantId: z.string().min(1),
  isAvailable: z.boolean().optional(),
});

module.exports = { mealSchema, MEAL_CATEGORIES };
