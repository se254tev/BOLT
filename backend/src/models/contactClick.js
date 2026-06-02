const mongoose = require('mongoose');

const contactClickSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  channel: { type: String, enum: ['whatsapp', 'phone', 'sms'], required: true },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

contactClickSchema.index({ sellerId: 1 });
contactClickSchema.index({ productId: 1 });
contactClickSchema.index({ channel: 1 });

module.exports = mongoose.model('ContactClick', contactClickSchema);
