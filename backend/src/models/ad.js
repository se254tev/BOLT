const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slot: { type: String, trim: true, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  link: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AdSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Ad', AdSchema);
