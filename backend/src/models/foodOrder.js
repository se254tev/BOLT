const mongoose = require('mongoose');
const { PAYMENT_STATUS_VALUES } = require('../utils/paymentConstants');

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

foodOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
