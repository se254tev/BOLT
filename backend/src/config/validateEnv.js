const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const validateEnv = () => {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required env: ${key}`);
    }
  });
};

module.exports = { validateEnv };