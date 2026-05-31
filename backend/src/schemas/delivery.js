const { z } = require('zod');

const locationSchema = z.object({ lat: z.number(), lng: z.number() });

const createDeliverySchema = z.object({
  productId: z.string().min(1),
  sellerId: z.string().min(1),
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
  fee: z.number().nonnegative().optional(),
  deliveryMode: z.enum(['seller_delivery', 'platform_delivery']).default('seller_delivery'),
});

const updateLocationSchema = z.object({ lat: z.number(), lng: z.number() });

const updateStatusSchema = z.object({
  status: z.enum([
    'pending_assignment',
    'assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'failed',
    'cancelled',
  ]),
});

module.exports = { createDeliverySchema, updateLocationSchema, updateStatusSchema };
