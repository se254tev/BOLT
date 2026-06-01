const User = require('../models/user');
const { getSubscriptionForAgent } = require('./subscriptionService');
const AuditLog = require('../models/auditLog');

const listUsers = async () => User.find().select('-password').lean();

const getUser = async (id) => User.findById(id).select('-password');

const updateUser = async ({ id, user, payload }) => {
  const target = await User.findById(id);
  if (!target) throw new Error('User not found');
  if (target.id !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  const allowed = ['name', 'email', 'phone', 'profileImage'];
  if (user.role === 'admin' || user.role === 'super_admin') allowed.push('role', 'suspended');
  Object.keys(payload).forEach((key) => {
    if (allowed.includes(key)) {
      target[key] = payload[key];
    }
  });
  await target.save();
  await AuditLog.create({ adminId: user.id, action: 'update_user', resource: 'user', resourceId: id });
  return target;
};

const deleteUser = async ({ id, user }) => {
  if (id !== user.id && user.role !== 'admin') throw new Error('Unauthorized');
  const target = await User.findById(id);
  if (!target) throw new Error('User not found');
  await User.deleteOne({ _id: id });
  await AuditLog.create({ adminId: user.id, action: 'delete_user', resource: 'user', resourceId: id });
  return true;
};

const getAgentSubscription = async (agentId) => getSubscriptionForAgent(agentId);

const getPaymentMethods = async (userId) => {
  const user = await User.findById(userId).select('paymentMethods');
  return user ? user.paymentMethods : null;
};

module.exports = { listUsers, getUser, updateUser, deleteUser, getAgentSubscription, getPaymentMethods };
