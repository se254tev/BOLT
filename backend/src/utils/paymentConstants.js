/**
 * PAYMENT_STATUS Enum - Unified Source of Truth for Payment States
 * 
 * Used across all payment entities (FoodOrder, DeliveryOrder, Subscriptions, etc.)
 * Migration: Legacy 'orderPaymentStatus' field replaced with 'paymentStatus'
 * 
 * STATE FLOW:
 *   1. PENDING          → Initial state when order created
 *   2. AWAITING_PAYMENT → Buyer has order, waiting for payment submission
 *   3. AWAITING_SELLER_CONFIRMATION → Buyer submitted proof, awaiting admin/seller approval
 *   4. PAID             → Admin approved, payment confirmed
 *   5. PAYMENT_REJECTED → Admin rejected proof, buyer must resubmit
 *   6. REFUNDED         → Payment refunded to buyer
 *   7. PROCESSING       → Payment being processed
 *   8. READY_FOR_DELIVERY → Order ready, awaiting delivery
 *   9. OUT_FOR_DELIVERY → Delivery in progress
 *  10. DELIVERED        → Delivered to buyer
 *  11. COMPLETED        → Order completed successfully
 *  12. CANCELLED        → Order cancelled by buyer or system
 */

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  AWAITING_SELLER_CONFIRMATION: 'AWAITING_SELLER_CONFIRMATION',
  PAID: 'PAID',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  REFUNDED: 'REFUNDED',
  PROCESSING: 'PROCESSING',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

/**
 * List of valid payment status values (for enum validation)
 */
const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

/**
 * Legacy payment status mappings (for backward compatibility during migration)
 * These map old values to new standardized values
 */
const LEGACY_TO_NEW_STATUS = Object.freeze({
  // From cart.js (lowercase)
  'pending': PAYMENT_STATUS.PENDING,
  'completed': PAYMENT_STATUS.COMPLETED,
  'failed': PAYMENT_STATUS.PAYMENT_REJECTED,
  'refunded': PAYMENT_STATUS.REFUNDED,
  
  // From old orderPaymentStatus (lowercase)
  'paid': PAYMENT_STATUS.PAID,
});

/**
 * Get all payment statuses as array for schema enum validation
 * @returns {string[]} Array of valid payment statuses
 */
const getAllPaymentStatuses = () => PAYMENT_STATUS_VALUES;

module.exports = {
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  LEGACY_TO_NEW_STATUS,
  getAllPaymentStatuses,
};
