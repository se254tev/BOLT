const { z } = require('zod');

const restaurantSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  location: z.object({
    address: z.string().max(500).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  image: z.string().url().optional(),
  openHours: z.string().max(200).optional(),
});

module.exports = { restaurantSchema };
