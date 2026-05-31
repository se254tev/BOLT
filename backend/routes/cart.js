const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ cart: [] }));
router.post('/', (req, res) => res.status(201).json({ item: req.body }));
router.put('/:id', (req, res) => res.json({ item: req.body }));
router.delete('/:id', (req, res) => res.status(204).send());

module.exports = router;
