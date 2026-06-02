const mongoose = require('mongoose');
const { PAYMENT_STATUS_VALUES } = require('../utils/paymentConstants');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true, default: [] },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, default: 'created' },
  paymentStatus: { type: String, enum: PAYMENT_STATUS_VALUES, default: 'PENDING' },
  sellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.index({ buyerId: 1 });
orderSchema.index({ sellerIds: 1 });

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
