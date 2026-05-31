const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ properties: [] }));
router.get('/:id', (req, res) => res.json({ property: { _id: req.params.id } }));
router.post('/', (req, res) => res.status(201).json({ property: req.body }));
router.put('/:id', (req, res) => res.json({ property: req.body }));
router.delete('/:id', (req, res) => res.status(204).send());

module.exports = router;
