const mongoose = require('mongoose');

const agentSubscriptionSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planType: { type: String, enum: ['free', 'pro', 'agency'], default: 'free' },
  maxListings: { type: Number, default: 3 },
  activeListingsCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AgentSubscription', agentSubscriptionSchema);
