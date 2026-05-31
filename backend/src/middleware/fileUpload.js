const multer = require('multer');
const path = require('path');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const maxFileSize = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter,
});

module.exports = { upload, allowedExtensions, maxFileSize };
