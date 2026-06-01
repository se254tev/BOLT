const mongoose = require('mongoose');

const paymentAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: { type: String },
  orderId: { type: String },
  reason: { type: String },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentAudit', paymentAuditSchema);
