const Favorite = require('../models/favorite');
const AuditLog = require('../models/auditLog');

const listFavorites = async (userId) => Favorite.find({ userId }).populate('productId').lean();

const addFavorite = async ({ userId, productId }) => {
  const favorite = await Favorite.findOne({ userId, productId });
  if (favorite) return favorite;
  const created = await Favorite.create({ userId, productId });
  await AuditLog.create({ adminId: userId, action: 'add_favorite', resource: 'favorite', resourceId: created.id });
  return created;
};

const removeFavorite = async ({ userId, productId }) => {
  const favorite = await Favorite.findOne({ userId, productId });
  if (!favorite) throw new Error('Favorite not found');
  await Favorite.deleteOne({ _id: favorite.id });
  await AuditLog.create({ adminId: userId, action: 'remove_favorite', resource: 'favorite', resourceId: favorite.id });
  return true;
};

module.exports = { listFavorites, addFavorite, removeFavorite };
