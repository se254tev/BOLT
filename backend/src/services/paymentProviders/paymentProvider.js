class PaymentProvider {
  async initiatePayment(payload) { throw new Error('Not implemented'); }
  async verifyPayment(payload) { throw new Error('Not implemented'); }
  async refundPayment(payload) { throw new Error('Not implemented'); }
}

module.exports = PaymentProvider;
