const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  images: [{ type: String, trim: true }],
  verified: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.index({ sellerId: 1 });
productSchema.index({ sellerId: 1, verified: 1 });

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
