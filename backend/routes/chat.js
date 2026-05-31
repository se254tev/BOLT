const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ conversations: [] }));
router.post('/', (req, res) => res.status(201).json({ conversation: req.body }));
router.get('/:id/messages', (req, res) => res.json({ messages: [] }));
router.post('/:id/messages', (req, res) => res.status(201).json({ message: req.body }));

module.exports = router;
