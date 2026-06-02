const mongoose = require('mongoose');

const serviceReviewSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceAssignment', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceWorker', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

serviceReviewSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ServiceReview', serviceReviewSchema);
