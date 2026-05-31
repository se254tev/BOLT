const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ favorites: [] }));
router.post('/', (req, res) => res.status(201).json({ favorite: req.body }));
router.delete('/:id', (req, res) => res.status(204).send());

module.exports = router;
