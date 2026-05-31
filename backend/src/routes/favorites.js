const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const favoriteController = require('../controllers/favoriteController');

router.get('/', authenticate, favoriteController.listFavorites);
router.post('/:id', authenticate, validateObjectId('id'), favoriteController.addFavorite);
router.delete('/:id', authenticate, validateObjectId('id'), favoriteController.removeFavorite);

module.exports = router;
