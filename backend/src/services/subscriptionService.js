const AgentSubscription = require('../models/agentSubscription');
const config = require('../config');

const PLAN_DEFINITIONS = {
  free: { maxListings: 3 },
  pro: { maxListings: 20 },
  agency: { maxListings: Infinity },
};

const getSubscriptionForAgent = async (agentId) => {
  let sub = await AgentSubscription.findOne({ agentId });
  if (!sub) {
    sub = await AgentSubscription.create({ agentId, planType: 'free', maxListings: PLAN_DEFINITIONS.free.maxListings });
  }
  // check expiry
  if (sub.expiresAt && sub.expiresAt < new Date()) {
    sub.status = 'expired';
    await sub.save();
  }
  return sub;
};

const canCreateListing = async (agentId) => {
  const sub = await getSubscriptionForAgent(agentId);
  if (sub.status !== 'active') return false;
  if (sub.planType === 'agency') return true;
  return sub.activeListingsCount < sub.maxListings;
};

const incrementActiveListings = async (agentId) => {
  const sub = await getSubscriptionForAgent(agentId);
  sub.activeListingsCount = (sub.activeListingsCount || 0) + 1;
  await sub.save();
  return sub;
};

const decrementActiveListings = async (agentId) => {
  const sub = await getSubscriptionForAgent(agentId);
  sub.activeListingsCount = Math.max(0, (sub.activeListingsCount || 0) - 1);
  await sub.save();
  return sub;
};

const upgradeAgentPlan = async (agentId, planType, durationDays = 365) => {
  const def = PLAN_DEFINITIONS[planType];
  if (!def) throw new Error('Invalid plan');
  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 3600 * 1000) : null;
  const update = { planType, maxListings: def.maxListings, status: 'active', expiresAt };
  const sub = await AgentSubscription.findOneAndUpdate({ agentId }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
  return sub;
};

module.exports = { getSubscriptionForAgent, canCreateListing, incrementActiveListings, decrementActiveListings, upgradeAgentPlan };
