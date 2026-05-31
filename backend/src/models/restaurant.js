const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: {
    address: { type: String, trim: true },
    lat: Number,
    lng: Number,
  },
  image: { type: String, trim: true },
  rating: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  openHours: { type: String, trim: true },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

restaurantSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
