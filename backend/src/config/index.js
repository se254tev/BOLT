const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? [
      'https://boltmarket.com',
      'https://admin.boltmarket.com',
      'https://bolt-nu-ecru.vercel.app',
    ]
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://bolt-nu-ecru.vercel.app'];

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  allowedOrigins,
  cookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'bolt_refresh_token',
  adminCookieName: process.env.ADMIN_REFRESH_TOKEN_COOKIE_NAME || 'bolt_admin_refresh_token',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  isProduction,
};