const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ users: [] }));
router.get('/:id', (req, res) => res.json({ user: { _id: req.params.id } }));
router.put('/:id', (req, res) => res.json({ user: req.body }));
router.delete('/:id', (req, res) => res.status(204).send());

module.exports = router;
