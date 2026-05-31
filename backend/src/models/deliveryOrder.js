const mongoose = require('mongoose');

const deliveryOrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: String },
  foodOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodOrder' },
  pickupLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  dropoffLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  fee: { type: Number, default: 0 },
  deliveryMode: { type: String, enum: ['seller_delivery', 'platform_delivery'], default: 'seller_delivery' },
  status: {
    type: String,
    enum: ['pending_assignment', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending_assignment',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

deliveryOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);
