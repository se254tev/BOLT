const audit = require('../services/logger');
const ContactClick = require('../models/contactClick');

const contactClick = async (req, res) => {
  try {
    const { productId, sellerId, type, timestamp } = req.body || {};
    const buyerId = req.user ? req.user.id : null;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    // persist analytics
    await ContactClick.create({ buyerId, sellerId, productId, channel: type, ip, userAgent, createdAt: timestamp ? new Date(timestamp) : new Date() });
    audit.info('Contact click', { productId, sellerId, buyerId, type, timestamp });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const sellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const match = { sellerId };
    const total = await ContactClick.countDocuments(match);
    const whatsapp = await ContactClick.countDocuments({ ...match, channel: 'whatsapp' });
    const phone = await ContactClick.countDocuments({ ...match, channel: 'phone' });
    const sms = await ContactClick.countDocuments({ ...match, channel: 'sms' });
    const leads = await ContactClick.distinct('buyerId', match).then(a => a.length);
    // conversion rate: placeholder - actual order join needed for real conversion
    const conversionRate = 0;
    res.json({ total, whatsapp, phone, sms, leads, conversionRate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { contactClick, sellerAnalytics };
