/**
 * Unified Payment Model
 * 
 * This is a future-proof payment entity that abstracts payment handling
 * across all BOLT marketplace features:
 * - Food Orders
 * - Delivery Orders
 * - Property Listings (featured/boost)
 * - Seller Subscriptions
 * - Admin Overrides
 * 
 * This allows for:
 * 1. Unified payment analytics
 * 2. Consolidated audit trail
 * 3. Cross-feature payment state management
 * 4. Simplified payment service architecture
 * 
 * MIGRATION PATH:
 * Phase 1 (Current): Use unified PAYMENT_STATUS enum across order models
 * Phase 2 (Future): Migrate payment data from order.payment to this Payment entity
 * Phase 3 (Final): Order models reference Payment by ID
 */

const mongoose = require('mongoose');
const { PAYMENT_STATUS_VALUES } = require('../utils/paymentConstants');

const paymentSchema = new mongoose.Schema({
  // Payment identification
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  paymentType: {
    type: String,
    enum: ['FOOD_ORDER', 'DELIVERY_ORDER', 'PROPERTY_LISTING', 'SELLER_SUBSCRIPTION'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },

  // Parties involved
  payer: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    email: String,
  },
  receiver: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    name: String,
    email: String,
  },

  // Amount and currency
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'KES' },

  // Payment details
  method: { type: String },
  transactionCode: { type: String, unique: true, sparse: true },
  reference: { type: String },

  // Proof/documentation
  proofUrl: { type: String },
  mpesaMessage: { type: String },

  // Payment status (unified across all features)
  status: {
    type: String,
    enum: PAYMENT_STATUS_VALUES,
    default: 'PENDING',
    index: true,
  },

  // Approval chain
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedReference: { type: String },

  // Rejection tracking
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // Refund information
  refundedAt: { type: Date },
  refundReason: { type: String },
  refundAmount: { type: Number },

  // Audit and timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },

  // Metadata for extensibility
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
});

// Indexes for efficient querying
paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ receiver: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentType: 1, status: 1 });
paymentSchema.index({ approvedBy: 1, approvedAt: -1 });

// Pre-save middleware
paymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
