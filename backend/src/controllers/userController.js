const userService = require('../services/userService');

const listUsers = async (req, res) => {
  const users = await userService.listUsers();
  res.json({ users });
};

const getUser = async (req, res) => {
  const user = await userService.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json({ user });
};

const updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser({ id: req.params.id, user: req.user, payload: req.validated || req.body });
    res.json({ user: updated });
  } catch (err) {
    res.status(err.message === 'User not found' ? 404 : 403).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser({ id: req.params.id, user: req.user });
    res.status(204).send();
  } catch (err) {
    res.status(err.message === 'User not found' ? 404 : 403).json({ error: err.message });
  }
};

const getAgentSubscription = async (req, res) => {
  try {
    const subscription = await userService.getAgentSubscription(req.user.id);
    res.json({ subscription });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { listUsers, getUser, updateUser, deleteUser, getAgentSubscription };
