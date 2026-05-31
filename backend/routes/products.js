const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ products: [] }));
router.get('/:id', (req, res) => res.json({ product: { _id: req.params.id } }));
router.post('/', (req, res) => res.status(201).json({ product: req.body }));
router.put('/:id', (req, res) => res.json({ product: req.body }));
router.delete('/:id', (req, res) => res.status(204).send());

module.exports = router;
