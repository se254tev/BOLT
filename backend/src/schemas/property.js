const { z } = require('zod');

const propertySchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(2500).optional(),
  location: z.object({ address: z.string().optional(), lat: z.number().optional(), lng: z.number().optional() }).optional(),
  price: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  listingType: z.enum(['free','featured','premium']).optional(),
});

module.exports = { propertySchema };
