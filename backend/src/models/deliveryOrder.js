const mongoose = require('mongoose');
const { PAYMENT_STATUS_VALUES } = require('../utils/paymentConstants');

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

// Payment fields for manual payment verification
deliveryOrderSchema.add({
  payment: {
    method: { type: String },
    amount: { type: Number },
    transactionCode: { type: String },
    mpesaMessage: { type: String },
    screenshotUrl: { type: String },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedPaymentReference: { type: String },
    rejectionReason: { type: String },
  },
  paymentStatus: { type: String, enum: PAYMENT_STATUS_VALUES, default: 'PENDING' },
});

deliveryOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);
