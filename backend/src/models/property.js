const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true },
  location: {
    address: String,
    lat: Number,
    lng: Number,
  },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingType: { type: String, enum: ['free', 'featured', 'premium'], default: 'free' },
  isFeatured: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  boostLevel: { type: Number, min: 0, max: 3, default: 0 },
  boostStartDate: { type: Date },
  boostEndDate: { type: Date },
  boostStatus: { type: String, enum: ['none','pending','approved','rejected'], default: 'none' },
  mockPaymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  isVerified: { type: Boolean, default: false },
  viewsCount: { type: Number, default: 0 },
  inquiriesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  suspended: { type: Boolean, default: false },
});

propertySchema.index({ agentId: 1 });
propertySchema.index({ 'location.lat': 1, 'location.lng': 1 });

propertySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', propertySchema);
