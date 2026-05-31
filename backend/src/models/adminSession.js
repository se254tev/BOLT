const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jti: { type: String, required: true, index: true },
  refreshTokenHash: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceName: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isRevoked: { type: Boolean, default: false },
});

adminSessionSchema.index({ adminId: 1, isRevoked: 1 });
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminSession', adminSessionSchema);
