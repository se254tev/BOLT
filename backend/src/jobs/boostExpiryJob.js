const Property = require('../models/property');

const runExpiryPass = async () => {
  try {
    const now = new Date();
    // find expired featured properties
    const expired = await Property.find({ isFeatured: true, featuredUntil: { $lte: now } });
    for (const p of expired) {
      p.isFeatured = false;
      p.boostStatus = 'none';
      p.boostLevel = 0;
      p.featuredUntil = null;
      p.boostStartDate = null;
      p.boostEndDate = null;
      await p.save();
    }
    // also clear any pending boosts that have passed their end date
    const pendingExpired = await Property.find({ boostStatus: 'pending', boostEndDate: { $lte: now } });
    for (const p of pendingExpired) {
      p.boostStatus = 'rejected';
      p.mockPaymentStatus = 'failed';
      await p.save();
    }
  } catch (err) {
    console.warn('Boost expiry job failed', err.message);
  }
};

const start = () => {
  // run immediately then every hour
  runExpiryPass();
  setInterval(runExpiryPass, 1000 * 60 * 60);
};

module.exports = { start };
