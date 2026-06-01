const PaymentProvider = require('./paymentProvider');

class ManualPaymentProvider extends PaymentProvider {
  async initiatePayment(payload) {
    // Manual provider doesn't initiate remote payment; return a placeholder
    return { success: true, note: 'manual' };
  }

  async verifyPayment(payload) {
    // Manual verification is performed by seller via UI.
    return { verified: false };
  }

  async refundPayment(payload) {
    // Not implemented for manual provider
    return { refunded: false };
  }
}

module.exports = ManualPaymentProvider;
