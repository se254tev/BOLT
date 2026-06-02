const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['MARKETPLACE_ORDER', 'RIDE_REQUEST', 'ERRAND_REQUEST'],
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceWorker' },
  selectedBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceBid' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceAssignment' },
  bidIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceBid' }],
  requestState: {
    type: String,
    enum: ['OPEN', 'BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED'],
    default: 'OPEN',
    required: true,
  },
  rideDetails: {
    pickupLocation: { type: String },
    destination: { type: String },
    name: { type: String },
    phoneNumber: { type: String },
    selfieUrl: { type: String },
    landmarkUrl: { type: String },
    serviceType: { type: String },
  },
  errandDetails: {
    taskDescription: { type: String },
    pickupLocation: { type: String },
    attachments: [{ type: String }],
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    budgetCurrency: { type: String, default: 'USD' },
  },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

serviceRequestSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
