const favoriteService = require('../services/favoriteService');

const listFavorites = async (req, res) => {
  const favorites = await favoriteService.listFavorites(req.user.id);
  res.json({ favorites });
};

const addFavorite = async (req, res) => {
  try {
    const favorite = await favoriteService.addFavorite({ userId: req.user.id, productId: req.params.id });
    res.status(201).json({ favorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    await favoriteService.removeFavorite({ userId: req.user.id, productId: req.params.id });
    res.status(204).send();
  } catch (err) {
    res.status(err.message === 'Favorite not found' ? 404 : 400).json({ error: err.message });
  }
};

module.exports = { listFavorites, addFavorite, removeFavorite };
