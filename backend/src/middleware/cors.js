const cors = require('cors');
const config = require('../config');

const allowedOrigins = Array.from(new Set([
  ...(config.allowedOrigins || []),
  'https://bolt-nu-ecru.vercel.app',
  'http://localhost:3000',
]));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return config.isProduction
        ? callback(new Error('CORS origin missing'))
        : callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Blocked by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

module.exports = {
  corsMiddleware,
  corsOptions,
};
