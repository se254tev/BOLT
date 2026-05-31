const Property = require('../models/property');
const AuditLog = require('../models/auditLog');
const { getSubscriptionForAgent, canCreateListing, incrementActiveListings } = require('../services/subscriptionService');
const { computeRankingScore } = require('../services/rankingService');

const audit = async ({ adminId, action, resource, resourceId, ipAddress, userAgent }) => {
  await AuditLog.create({ adminId, action, resource, resourceId, ipAddress, userAgent });
};

const createProperty = async (req, res) => {
  // Only sellers can create
  if (req.user.role !== 'seller') return res.status(403).json({ error: 'Only agents/sellers can create listings' });
  const allowed = await canCreateListing(req.user.id);
  if (!allowed) return res.status(403).json({ error: 'Listing limit exceeded for your subscription plan' });
  const payload = req.validated || req.body;
  payload.agentId = req.user.id;
  const prop = await Property.create(payload);
  await incrementActiveListings(req.user.id);
  res.status(201).json({ property: prop });
};

const listProperties = async (req, res) => {
  const { search, featured, verified } = req.query;
  const q = { suspended: { $ne: true } };
  if (search) q.$text = { $search: search };
  if (featured === 'true') q.isFeatured = true;
  if (verified === 'true') q.isVerified = true;
  const props = await Property.find(q).lean();
  // attach ranking score
  const withScore = props.map((p) => ({ ...p, rankingScore: computeRankingScore(p) }));
  withScore.sort((a, b) => {
    const aFeatured = a.isFeatured && a.featuredUntil && new Date(a.featuredUntil) > new Date();
    const bFeatured = b.isFeatured && b.featuredUntil && new Date(b.featuredUntil) > new Date();
    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
    if (b.rankingScore !== a.rankingScore) return b.rankingScore - a.rankingScore;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json({ properties: withScore });
};

const getProperty = async (req, res) => {
  const id = req.params.id;
  const prop = await Property.findById(id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  // increment views
  prop.viewsCount = (prop.viewsCount || 0) + 1;
  await prop.save();
  res.json({ property: prop });
};

const boostProperty = async (req, res) => {
  const id = req.params.id;
  const { durationDays = 7, boostLevel = 1, mockPaymentStatus = 'pending' } = req.body;
  const prop = await Property.findById(id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  if (prop.agentId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not owner' });
  const agent = req.user;
  if (!agent.isVerified) return res.status(403).json({ error: 'Only verified agents can boost listings' });
  // validate duration
  const allowedDurations = [7, 14, 30];
  if (!allowedDurations.includes(durationDays)) return res.status(400).json({ error: 'Invalid duration' });
  prop.boostStatus = 'pending';
  prop.boostLevel = boostLevel;
  prop.boostStartDate = new Date();
  prop.boostEndDate = new Date(Date.now() + durationDays * 24 * 3600 * 1000);
  prop.mockPaymentStatus = mockPaymentStatus; // pending/paid/failed
  if (mockPaymentStatus === 'paid') {
    prop.isFeatured = true;
    prop.featuredUntil = prop.boostEndDate;
    prop.boostStatus = 'approved';
  }
  await prop.save();
  await audit({ adminId: req.user.id, action: 'request_boost', resource: 'property', resourceId: id, ipAddress: req.ip, userAgent: req.get('User-Agent') });
  res.json({ message: 'Boost requested', property: prop });
};

const getFeatured = async (req, res) => {
  const now = new Date();
  const props = await Property.find({ isFeatured: true, featuredUntil: { $gt: now }, suspended: { $ne: true } }).lean();
  const withScore = props.map((p) => ({ ...p, rankingScore: computeRankingScore(p) }));
  withScore.sort((a, b) => b.rankingScore - a.rankingScore);
  res.json({ properties: withScore });
};

const updateProperty = async (req, res) => {
  const id = req.params.id;
  const prop = await Property.findById(id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  if (prop.agentId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const payload = req.validated || req.body;
  Object.assign(prop, payload);
  await prop.save();
  res.json({ property: prop });
};

const deleteProperty = async (req, res) => {
  const id = req.params.id;
  const prop = await Property.findById(id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  if (prop.agentId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  await Property.deleteOne({ _id: id });
  res.status(204).send();
};

const incrementInquiry = async (req, res) => {
  const id = req.params.id;
  const prop = await Property.findById(id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  prop.inquiriesCount = (prop.inquiriesCount || 0) + 1;
  await prop.save();
  res.json({ message: 'Inquiry recorded' });
};

module.exports = { createProperty, listProperties, getProperty, boostProperty, getFeatured, incrementInquiry, updateProperty, deleteProperty };
