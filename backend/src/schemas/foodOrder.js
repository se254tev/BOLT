const { z } = require('zod');

const locationSchema = z.object({ lat: z.number(), lng: z.number() });

const orderItemSchema = z.object({
  mealId: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().nonnegative(),
});

const foodOrderSchema = z.object({
  restaurantId: z.string().min(1),
  mealItems: z.array(orderItemSchema).min(1),
  deliveryMode: z.enum(['pickup', 'delivery', 'rider']),
  deliveryAddress: z.string().trim().optional(),
  dropoffLocation: locationSchema.optional(),
  orderPaymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
}).superRefine((order, ctx) => {
  if (['delivery', 'rider'].includes(order.deliveryMode) && !order.dropoffLocation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dropoffLocation'],
      message: 'dropoffLocation is required for delivery or rider orders',
    });
  }
});

const orderStatusSchema = z.object({
  status: z.enum([
    'created',
    'payment_pending',
    'paid',
    'accepted',
    'rejected',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'completed',
    'cancelled',
    'refunded',
  ]),
});

module.exports = { foodOrderSchema, orderStatusSchema };
