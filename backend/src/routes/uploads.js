const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadPaymentProof } = require('../controllers/uploadsController');

const uploadDir = path.join(__dirname, '../../tmp/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported image type. Use JPG, PNG, or WEBP.'));
    }
  },
});

const router = express.Router();

router.post('/payment-proof', upload.single('image'), uploadPaymentProof);

module.exports = router;
