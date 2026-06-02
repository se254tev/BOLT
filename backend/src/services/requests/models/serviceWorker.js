const mongoose = require('mongoose');

const serviceWorkerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, enum: ['RIDER', 'SHOPPER'], required: true },
  phoneNumber: { type: String, required: true },
  profileImage: { type: String },
  serviceType: { type: String, required: true },
  legalDocumentUrl: { type: String },
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: 0 },
  availabilityStatus: { type: String, enum: ['AVAILABLE', 'UNAVAILABLE', 'BUSY'], default: 'AVAILABLE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

serviceWorkerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ServiceWorker', serviceWorkerSchema);
