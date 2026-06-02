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
  // Seller lifecycle status: none -> pending -> approved -> active -> rejected
  sellerStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'active', 'rejected'],
    default: 'none',
  },
  sellerApplication: {
    businessName: { type: String },
    businessPhone: { type: String },
    businessAddress: { type: String },
    nationalId: { type: String },
    taxNumber: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  applicationDate: { type: Date },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
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
  paymentMethods: {
    mpesaPhone: { type: String },
    mpesaTill: { type: String },
    mpesaPaybill: { type: String },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    accountName: { type: String },
    airtelMoneyNumber: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.hasRole = function (roles) {
  return roles.includes(this.role);
};

// index for quick seller status queries
userSchema.index({ sellerStatus: 1 });

module.exports = mongoose.model('User', userSchema);
