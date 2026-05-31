const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

const uploadImage = async (filePath, folder = 'bolt-marketplace') => {
  const extension = filePath.split('.').pop().toLowerCase();
  if (!allowedFormats.includes(extension)) {
    throw new Error('Unsupported file format.');
  }
  return cloudinary.uploader.upload(filePath, {
    folder,
    use_filename: false,
    unique_filename: true,
    overwrite: false,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

module.exports = { uploadImage, allowedFormats };
