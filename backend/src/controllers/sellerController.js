const User = require('../models/user');
const AuditLog = require('../models/auditLog');
const sellerService = require('../services/sellerService');

const applySeller = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'buyer') return res.status(400).json({ error: 'Only buyers may apply to become sellers' });
    if (user.sellerStatus && user.sellerStatus !== 'none' && user.sellerStatus !== 'rejected') {
      return res.status(400).json({ error: 'Application already submitted or account already a seller' });
    }

    const { businessName, businessPhone, businessAddress, nationalId, taxNumber } = req.body || {};
    if (!businessName || !businessPhone || !businessAddress) return res.status(400).json({ error: 'businessName, businessPhone and businessAddress are required' });

    const dbUser = await User.findById(user.id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    dbUser.sellerStatus = 'pending';
    dbUser.applicationDate = new Date();
    dbUser.rejectionReason = undefined;
    dbUser.rejectedAt = undefined;
    dbUser.sellerApplication = {
      businessName: String(businessName).trim(),
      businessPhone: String(businessPhone).trim(),
      businessAddress: String(businessAddress).trim(),
      nationalId: nationalId ? String(nationalId).trim() : undefined,
      taxNumber: taxNumber ? String(taxNumber).trim() : undefined,
      submittedAt: new Date(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      rejectionReason: undefined,
    };
    await dbUser.save();

    await AuditLog.create({ adminId: null, action: 'seller_application_submitted', resource: 'user', resourceId: dbUser.id });

    res.json({ sellerStatus: dbUser.sellerStatus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const activateSeller = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const dbUser = await User.findById(user.id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    if (dbUser.sellerStatus !== 'approved') return res.status(400).json({ error: 'Seller not approved' });

    dbUser.sellerStatus = 'active';
    dbUser.role = 'seller';
    dbUser.activatedAt = new Date();
    await dbUser.save();

    await AuditLog.create({ adminId: null, action: 'seller_activated', resource: 'user', resourceId: dbUser.id });

    res.json({ role: dbUser.role, sellerStatus: dbUser.sellerStatus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const dashboard = await sellerService.getSellerDashboard(user.id);
    res.json(dashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { applySeller, activateSeller, getDashboard };
