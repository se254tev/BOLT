const productService = require('../services/productService');

const listProducts = async (req, res) => {
  const products = await productService.listProducts({
    search: req.query.search,
    category: req.query.category,
    sellerId: req.query.sellerId,
    verified: req.query.verified,
  });
  res.json({ products });
};

const getProduct = async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct({ user: req.user, payload: req.validated || req.body });
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct({ id: req.params.id, user: req.user, payload: req.validated || req.body });
    res.json({ product });
  } catch (err) {
    res.status(err.message === 'Product not found' ? 404 : 403).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct({ id: req.params.id, user: req.user });
    res.status(204).send();
  } catch (err) {
    res.status(err.message === 'Product not found' ? 404 : 403).json({ error: err.message });
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
