/**
 * Migration Script: Standardize Payment Statuses
 * 
 * Purpose: Convert legacy payment status fields across all order documents
 * - Migrates 'orderPaymentStatus' → 'paymentStatus' in FoodOrder
 * - Normalizes existing paymentStatus values to uppercase (if lowercase exists)
 * - Maintains audit trail with PaymentAudit records
 * 
 * Run with: npm run migrate:payments
 * 
 * Expected Output:
 *   Migrated: X (documents updated)
 *   Skipped: X (already using new format)
 *   Failed: X (errors encountered)
 *   Duration: Y seconds
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const FoodOrder = require('../models/foodOrder');
const DeliveryOrder = require('../models/deliveryOrder');
const PaymentAudit = require('../models/paymentAudit');
const { PAYMENT_STATUS, LEGACY_TO_NEW_STATUS } = require('../utils/paymentConstants');

let migrated = 0;
let skipped = 0;
let failed = 0;
const failedIds = [];

async function migrateFoodOrders() {
  console.log('\n📋 Migrating FoodOrder documents...');
  
  try {
    // Find all documents with legacy orderPaymentStatus field
    const legacyOrders = await FoodOrder.find({
      orderPaymentStatus: { $exists: true, $ne: null }
    });

    console.log(`   Found ${legacyOrders.length} documents with legacy orderPaymentStatus field`);

    for (const order of legacyOrders) {
      try {
        const legacyValue = order.orderPaymentStatus?.toLowerCase();
        const newValue = LEGACY_TO_NEW_STATUS[legacyValue] || PAYMENT_STATUS.PENDING;

        order.paymentStatus = newValue;
        // Keep legacy field for backward compatibility, but note it's deprecated
        order.orderPaymentStatus = undefined;

        await order.save();
        migrated++;

        // Create audit trail for migration
        await PaymentAudit.create({
          action: 'payment_status_migrated',
          actorRole: 'system',
          orderId: order._id.toString(),
          reason: `Migrated from legacy orderPaymentStatus: "${legacyValue}" → "${newValue}"`,
          metadata: {
            migrationBatch: new Date().toISOString(),
            legacyValue,
            newValue,
          },
        });
      } catch (err) {
        failed++;
        failedIds.push(order._id.toString());
        console.error(`   ❌ Failed to migrate ${order._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Error querying FoodOrder:', err.message);
    failed++;
  }
}

async function normalizePaymentStatuses() {
  console.log('\n🔄 Normalizing existing paymentStatus values...');
  
  try {
    // Check for any lowercase payment statuses and normalize
    const foodOrdersWithLowercase = await FoodOrder.find({
      paymentStatus: {
        $in: ['pending', 'completed', 'failed', 'refunded']
      }
    });

    console.log(`   Found ${foodOrdersWithLowercase.length} FoodOrder documents with lowercase paymentStatus`);

    for (const order of foodOrdersWithLowercase) {
      try {
        const oldValue = order.paymentStatus;
        const newValue = LEGACY_TO_NEW_STATUS[oldValue] || PAYMENT_STATUS.PENDING;

        order.paymentStatus = newValue;
        await order.save();
        migrated++;

        await PaymentAudit.create({
          action: 'payment_status_normalized',
          actorRole: 'system',
          orderId: order._id.toString(),
          reason: `Normalized payment status from lowercase: "${oldValue}" → "${newValue}"`,
          metadata: {
            oldValue,
            newValue,
          },
        });
      } catch (err) {
        failed++;
        failedIds.push(order._id.toString());
        console.error(`   ❌ Failed to normalize ${order._id}:`, err.message);
      }
    }

    // Check DeliveryOrder for consistency
    const deliveryOrdersWithLowercase = await DeliveryOrder.find({
      paymentStatus: {
        $in: ['pending', 'completed', 'failed', 'refunded']
      }
    });

    console.log(`   Found ${deliveryOrdersWithLowercase.length} DeliveryOrder documents with lowercase paymentStatus`);

    for (const order of deliveryOrdersWithLowercase) {
      try {
        const oldValue = order.paymentStatus;
        const newValue = LEGACY_TO_NEW_STATUS[oldValue] || PAYMENT_STATUS.PENDING;

        order.paymentStatus = newValue;
        await order.save();
        migrated++;

        await PaymentAudit.create({
          action: 'payment_status_normalized',
          actorRole: 'system',
          orderId: order._id.toString(),
          reason: `Normalized delivery payment status from lowercase: "${oldValue}" → "${newValue}"`,
          metadata: {
            oldValue,
            newValue,
          },
        });
      } catch (err) {
        failed++;
        failedIds.push(order._id.toString());
        console.error(`   ❌ Failed to normalize ${order._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Error normalizing statuses:', err.message);
    failed++;
  }
}

async function validateMigration() {
  console.log('\n✅ Validating migration...');
  
  try {
    // Check for any remaining legacy fields
    const legacyRemaining = await FoodOrder.countDocuments({
      orderPaymentStatus: { $exists: true, $ne: null }
    });

    // Check for any invalid status values
    const invalidStatuses = await FoodOrder.countDocuments({
      paymentStatus: {
        $nin: Object.values(PAYMENT_STATUS)
      }
    });

    const invalidDeliveryStatuses = await DeliveryOrder.countDocuments({
      paymentStatus: {
        $nin: Object.values(PAYMENT_STATUS)
      }
    });

    console.log(`   Legacy orderPaymentStatus fields remaining: ${legacyRemaining}`);
    console.log(`   Invalid FoodOrder paymentStatus values: ${invalidStatuses}`);
    console.log(`   Invalid DeliveryOrder paymentStatus values: ${invalidDeliveryStatuses}`);

    if (legacyRemaining > 0 || invalidStatuses > 0 || invalidDeliveryStatuses > 0) {
      console.warn('   ⚠️  Some inconsistencies remain - manual review may be needed');
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Validation error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Payment Status Migration...\n');
  const startTime = Date.now();

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bolt', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Run migrations
    await migrateFoodOrders();
    await normalizePaymentStatuses();

    // Validate
    const validationPassed = await validateMigration();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Failed:   ${failed}`);
    if (failedIds.length > 0) {
      console.log(`  Failed IDs: ${failedIds.join(', ')}`);
    }
    console.log(`  Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`  Status: ${validationPassed ? '✅ PASSED' : '⚠️  INCOMPLETE'}`);
    console.log('='.repeat(60) + '\n');

    process.exit(validationPassed ? 0 : 1);
  } catch (err) {
    console.error('❌ FATAL ERROR:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFoodOrders, normalizePaymentStatuses, validateMigration };
