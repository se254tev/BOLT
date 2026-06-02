const mongoose = require('mongoose');

const serviceBidSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceWorker', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['OPEN', 'SELECTED', 'REJECTED', 'CANCELLED'],
    default: 'OPEN',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

serviceBidSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ServiceBid', serviceBidSchema);
