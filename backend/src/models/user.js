const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin', 'super_admin'], default: 'buyer' },
  profileImage: { type: String },
  permissions: { type: [String], default: [] },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  mfaTempSecret: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active' },
  tokenVersion: { type: Number, default: 0 },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  // Delivery agent fields
  rating: { type: Number, default: 5.0 },
  totalDeliveries: { type: Number, default: 0 },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.hasRole = function (roles) {
  return roles.includes(this.role);
};

module.exports = mongoose.model('User', userSchema);
