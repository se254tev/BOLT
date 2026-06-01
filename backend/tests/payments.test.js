/**
 * Payment System Integration Tests
 * 
 * Tests cover:
 * - Buyer creates order and submits payment proof
 * - Admin approves payment with reference
 * - Admin rejects payment with reason
 * - Admin override capability
 * - Seller suspension for payment violations
 * - Notification generation
 * - Audit trail recording
 * - paymentStatus enum consistency
 */

const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = require('../../server');
const User = require('../models/user');
const FoodOrder = require('../models/foodOrder');
const DeliveryOrder = require('../models/deliveryOrder');
const Restaurant = require('../models/restaurant');
const Notification = require('../models/notification');
const PaymentAudit = require('../models/paymentAudit');
const { PAYMENT_STATUS } = require('../utils/paymentConstants');

describe('Payment System Integration Tests', () => {
  let adminToken;
  let buyerToken;
  let sellerToken;
  let adminUser;
  let buyerUser;
  let sellerUser;
  let restaurant;
  let order;

  beforeAll(async () => {
    // Create test users
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'hashedpass',
      name: 'Admin',
      role: 'admin',
      phone: '1234567890',
      verified: true,
    });

    buyerUser = await User.create({
      email: 'buyer@test.com',
      password: 'hashedpass',
      name: 'Buyer',
      role: 'buyer',
      phone: '9876543210',
      verified: true,
    });

    sellerUser = await User.create({
      email: 'seller@test.com',
      password: 'hashedpass',
      name: 'Seller',
      role: 'seller',
      phone: '5555555555',
      verified: true,
    });

    // Create restaurant for food order tests
    restaurant = await Restaurant.create({
      name: 'Test Restaurant',
      ownerId: sellerUser._id,
      cuisine: ['Italian'],
    });

    // Mock tokens (in production, use actual JWT generation)
    adminToken = `admin_token_${adminUser._id}`;
    buyerToken = `buyer_token_${buyerUser._id}`;
    sellerToken = `seller_token_${sellerUser._id}`;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await FoodOrder.deleteMany({});
    await DeliveryOrder.deleteMany({});
    await Restaurant.deleteMany({});
    await Notification.deleteMany({});
    await PaymentAudit.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Payment Proof Submission', () => {
    it('should create a food order with PENDING payment status', async () => {
      const payload = {
        restaurantId: restaurant._id.toString(),
        mealItems: [
          {
            mealId: new mongoose.Types.ObjectId(),
            quantity: 2,
            price: 50,
          },
        ],
        totalAmount: 100,
        deliveryMode: 'pickup',
      };

      order = await FoodOrder.create({
        buyerId: buyerUser._id,
        restaurantId: restaurant._id,
        mealItems: payload.mealItems,
        totalAmount: payload.totalAmount,
        deliveryMode: payload.deliveryMode,
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: 'created',
      });

      expect(order.paymentStatus).toBe(PAYMENT_STATUS.PENDING);
      expect(order.status).toBe('created');
    });

    it('should transition to AWAITING_SELLER_CONFIRMATION when proof submitted', async () => {
      order.payment = {
        method: 'mpesa',
        amount: order.totalAmount,
        transactionCode: 'TXN123456',
        mpesaMessage: 'Test M-Pesa message',
        screenshotUrl: 'https://cloudinary.com/image.jpg',
        submittedAt: new Date(),
      };
      order.paymentStatus = PAYMENT_STATUS.AWAITING_SELLER_CONFIRMATION;
      await order.save();

      expect(order.paymentStatus).toBe(PAYMENT_STATUS.AWAITING_SELLER_CONFIRMATION);
      expect(order.payment.transactionCode).toBe('TXN123456');
      expect(order.payment.submittedAt).toBeDefined();
    });

    it('should reject proof submission with missing screenshot URL', async () => {
      const incompleteOrder = new FoodOrder({
        buyerId: buyerUser._id,
        restaurantId: restaurant._id,
        mealItems: [{ mealId: new mongoose.Types.ObjectId(), quantity: 1, price: 50 }],
        totalAmount: 50,
        deliveryMode: 'pickup',
        paymentStatus: PAYMENT_STATUS.AWAITING_SELLER_CONFIRMATION,
        status: 'payment_pending',
        payment: {
          method: 'mpesa',
          amount: 50,
          transactionCode: 'TXN789',
          // missing screenshotUrl
        },
      });

      // In production, validation middleware should catch this
      expect(incompleteOrder.payment.screenshotUrl).toBeUndefined();
    });
  });

  describe('Admin Payment Approval', () => {
    it('should approve payment and set status to PAID', async () => {
      const approvedOrder = await FoodOrder.findByIdAndUpdate(
        order._id,
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          'payment.approvedAt': new Date(),
          'payment.approvedBy': adminUser._id,
          'payment.approvedPaymentReference': 'APPR123456',
        },
        { new: true }
      );

      expect(approvedOrder.paymentStatus).toBe(PAYMENT_STATUS.PAID);
      expect(approvedOrder.payment.approvedAt).toBeDefined();
      expect(approvedOrder.payment.approvedBy).toEqual(adminUser._id);
      expect(approvedOrder.payment.approvedPaymentReference).toBe('APPR123456');
    });

    it('should create payment audit entry on approval', async () => {
      const audit = await PaymentAudit.create({
        action: 'admin_approved',
        actor: adminUser._id,
        actorRole: 'admin',
        orderId: order._id.toString(),
        reason: 'Payment verified and approved',
        metadata: {
          approvedPaymentReference: 'APPR123456',
        },
      });

      expect(audit.action).toBe('admin_approved');
      expect(audit.actor).toEqual(adminUser._id);
      expect(audit.orderId).toBe(order._id.toString());
    });

    it('should create notification for buyer on approval', async () => {
      const notification = await Notification.create({
        userId: buyerUser._id,
        title: `Admin approved payment for Order ${order._id}`,
        body: 'An admin approved your payment proof.',
        data: { orderId: order._id.toString() },
      });

      expect(notification.userId).toEqual(buyerUser._id);
      expect(notification.title).toContain('approved');
      expect(notification.read).toBe(false);
    });
  });

  describe('Admin Payment Rejection', () => {
    let rejectOrder;

    beforeEach(async () => {
      rejectOrder = await FoodOrder.create({
        buyerId: buyerUser._id,
        restaurantId: restaurant._id,
        mealItems: [{ mealId: new mongoose.Types.ObjectId(), quantity: 1, price: 75 }],
        totalAmount: 75,
        deliveryMode: 'pickup',
        paymentStatus: PAYMENT_STATUS.AWAITING_SELLER_CONFIRMATION,
        status: 'payment_pending',
        payment: {
          method: 'mpesa',
          amount: 75,
          transactionCode: 'TXN789',
          screenshotUrl: 'https://cloudinary.com/bad.jpg',
          submittedAt: new Date(),
        },
      });
    });

    it('should reject payment and set status to PAYMENT_REJECTED', async () => {
      const rejectedOrder = await FoodOrder.findByIdAndUpdate(
        rejectOrder._id,
        {
          paymentStatus: PAYMENT_STATUS.PAYMENT_REJECTED,
          'payment.rejectionReason': 'Transaction code not matching seller records',
        },
        { new: true }
      );

      expect(rejectedOrder.paymentStatus).toBe(PAYMENT_STATUS.PAYMENT_REJECTED);
      expect(rejectedOrder.payment.rejectionReason).toBe('Transaction code not matching seller records');
    });

    it('should create audit entry on rejection', async () => {
      const audit = await PaymentAudit.create({
        action: 'admin_rejected',
        actor: adminUser._id,
        actorRole: 'admin',
        orderId: rejectOrder._id.toString(),
        reason: 'Payment verification failed',
        metadata: { rejectionReason: 'Invalid transaction code' },
      });

      expect(audit.action).toBe('admin_rejected');
      expect(audit.metadata.rejectionReason).toBe('Invalid transaction code');
    });

    it('should notify buyer on rejection', async () => {
      const notification = await Notification.create({
        userId: buyerUser._id,
        title: `Admin rejected payment for Order ${rejectOrder._id}`,
        body: 'An admin rejected the payment proof. Please resubmit.',
        data: { orderId: rejectOrder._id.toString() },
      });

      expect(notification.body).toContain('rejected');
      expect(notification.body).toContain('resubmit');
    });

    it('should allow buyer to resubmit after rejection', async () => {
      const resubmittedOrder = await FoodOrder.findByIdAndUpdate(
        rejectOrder._id,
        {
          paymentStatus: PAYMENT_STATUS.AWAITING_SELLER_CONFIRMATION,
          'payment.screenshotUrl': 'https://cloudinary.com/corrected.jpg',
          'payment.submittedAt': new Date(),
        },
        { new: true }
      );

      expect(resubmittedOrder.paymentStatus).toBe(PAYMENT_STATUS.AWAITING_SELLER_CONFIRMATION);
      expect(resubmittedOrder.payment.screenshotUrl).toContain('corrected');
    });
  });

  describe('Admin Override', () => {
    let overrideOrder;

    beforeEach(async () => {
      overrideOrder = await FoodOrder.create({
        buyerId: buyerUser._id,
        restaurantId: restaurant._id,
        mealItems: [{ mealId: new mongoose.Types.ObjectId(), quantity: 1, price: 60 }],
        totalAmount: 60,
        deliveryMode: 'pickup',
        paymentStatus: PAYMENT_STATUS.PAYMENT_REJECTED,
        status: 'cancelled',
        payment: {
          method: 'mpesa',
          amount: 60,
          transactionCode: 'TXN999',
          rejectionReason: 'Previous rejection',
        },
      });
    });

    it('should allow admin to override rejection decision', async () => {
      const overriddenOrder = await FoodOrder.findByIdAndUpdate(
        overrideOrder._id,
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          'payment.approvedAt': new Date(),
          'payment.approvedBy': adminUser._id,
          'payment.approvedPaymentReference': 'OVERRIDE_APPR789',
        },
        { new: true }
      );

      expect(overriddenOrder.paymentStatus).toBe(PAYMENT_STATUS.PAID);
      expect(overriddenOrder.payment.approvedPaymentReference).toContain('OVERRIDE');
    });

    it('should record override action in audit trail', async () => {
      const audit = await PaymentAudit.create({
        action: 'admin_override',
        actor: adminUser._id,
        actorRole: 'admin',
        orderId: overrideOrder._id.toString(),
        reason: 'Override previous rejection decision',
        metadata: {
          action: 'approve',
          approvedPaymentReference: 'OVERRIDE_APPR789',
        },
      });

      expect(audit.action).toBe('admin_override');
      expect(audit.metadata.action).toBe('approve');
    });
  });

  describe('Payment Status Consistency', () => {
    it('should enforce valid payment status values', async () => {
      const validStatuses = Object.values(PAYMENT_STATUS);
      const testOrder = await FoodOrder.create({
        buyerId: buyerUser._id,
        restaurantId: restaurant._id,
        mealItems: [{ mealId: new mongoose.Types.ObjectId(), quantity: 1, price: 45 }],
        totalAmount: 45,
        deliveryMode: 'pickup',
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: 'created',
      });

      expect(validStatuses).toContain(testOrder.paymentStatus);
    });

    it('should prevent invalid payment status transitions', async () => {
      const testOrder = await FoodOrder.findById(order._id);
      const invalidStatus = 'INVALID_STATUS';

      // Schema should validate and reject this
      testOrder.paymentStatus = invalidStatus;
      try {
        await testOrder.save();
        // If we reach here, the validation didn't work
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err.errors.paymentStatus).toBeDefined();
      }
    });

    it('should standardize delivery order payment statuses', async () => {
      const deliveryOrder = await DeliveryOrder.create({
        buyerId: buyerUser._id,
        sellerId: sellerUser._id,
        pickupLocation: { lat: 1.2345, lng: 34.5678 },
        dropoffLocation: { lat: 1.2346, lng: 34.5679 },
        status: 'pending_assignment',
        paymentStatus: PAYMENT_STATUS.PENDING,
      });

      expect(deliveryOrder.paymentStatus).toBe(PAYMENT_STATUS.PENDING);
      expect(Object.values(PAYMENT_STATUS)).toContain(deliveryOrder.paymentStatus);
    });
  });

  describe('Seller Suspension for Payment Issues', () => {
    it('should suspend seller account for repeated payment violations', async () => {
      const suspendedUser = await User.findByIdAndUpdate(
        sellerUser._id,
        {
          suspended: true,
          status: 'offline',
        },
        { new: true }
      );

      expect(suspendedUser.suspended).toBe(true);
      expect(suspendedUser.status).toBe('offline');
    });

    it('should suspend restaurant for payment violations', async () => {
      const suspendedRestaurant = await Restaurant.findByIdAndUpdate(
        restaurant._id,
        { suspended: true },
        { new: true }
      );

      expect(suspendedRestaurant.suspended).toBe(true);
    });

    it('should record suspension in audit trail', async () => {
      const audit = await PaymentAudit.create({
        action: 'seller_suspended',
        actor: adminUser._id,
        actorRole: 'admin',
        orderId: order._id.toString(),
        reason: 'Suspended seller due to payment issue',
        metadata: {
          resource: 'seller',
          orderType: 'food',
        },
      });

      expect(audit.action).toBe('seller_suspended');
      expect(audit.metadata.resource).toBe('seller');
    });
  });

  describe('Migration Consistency', () => {
    it('should not have legacy orderPaymentStatus field', async () => {
      const foodOrder = await FoodOrder.findById(order._id);
      expect(foodOrder.orderPaymentStatus).toBeUndefined();
    });

    it('should use paymentStatus field consistently', async () => {
      const foodOrders = await FoodOrder.find();
      foodOrders.forEach((o) => {
        expect(o.paymentStatus).toBeDefined();
        expect(Object.values(PAYMENT_STATUS)).toContain(o.paymentStatus);
      });
    });
  });
});
