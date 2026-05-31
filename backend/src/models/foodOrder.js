const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  mealItems: [
    {
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  deliveryMode: { type: String, enum: ['pickup', 'delivery', 'rider'], default: 'pickup' },
  deliveryAddress: { type: String, trim: true },
  dropoffLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryOrder' },
  status: {
    type: String,
    enum: [
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
    ],
    default: 'created',
  },
  orderPaymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

foodOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
