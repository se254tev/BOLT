const cartService = require('../services/cartService');

const getCart = async (req, res) => {
  const cart = await cartService.getCartForUser(req.user.id);
  if (!cart) {
    return res.json({ cart: { id: '', userId: req.user.id, items: [], total: 0, paymentStatus: 'pending' } });
  }
  res.json({ cart });
};

const createCart = async (req, res) => {
  try {
    const payload = { ...req.validated, userId: req.user.id };
    const cart = await cartService.createCart({ user: req.user, payload });
    res.status(201).json({ cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const cart = await cartService.updateCart({ id: req.params.id, user: req.user, payload: req.validated || req.body });
    res.json({ cart });
  } catch (err) {
    res.status(err.message === 'Cart not found' ? 404 : 403).json({ error: err.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    await cartService.deleteCart({ id: req.params.id, user: req.user });
    res.status(204).send();
  } catch (err) {
    res.status(err.message === 'Cart not found' ? 404 : 403).json({ error: err.message });
  }
};

module.exports = { getCart, createCart, updateCart, deleteCart };
