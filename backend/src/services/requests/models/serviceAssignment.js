const mongoose = require('mongoose');

const serviceAssignmentSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceBid', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceWorker', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED'],
    default: 'ASSIGNED',
    required: true,
  },
  assignedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

serviceAssignmentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ServiceAssignment', serviceAssignmentSchema);
