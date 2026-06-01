const fs = require('fs');
const path = require('path');
const { uploadImage } = require('../services/cloudinaryService');

const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePath = req.file.path;
    const result = await uploadImage(imagePath, 'bolt-marketplace/payment-proofs');
    res.json({ url: result.secure_url || result.url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
};

module.exports = { uploadPaymentProof };
