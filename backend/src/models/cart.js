const mongoose = require('mongoose');
const { PAYMENT_STATUS_VALUES } = require('../utils/paymentConstants');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [cartItemSchema], required: true, default: [] },
  total: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: PAYMENT_STATUS_VALUES, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
