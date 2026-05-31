const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const logger = require('./services/logger');
const requestId = require('./middleware/requestId');
const requestLogger = require('./middleware/requestLogger');
const { responseFormatter } = require('./middleware/responseFormatter');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');
const { sanitizeMiddleware } = require('./middleware/sanitize');
const metricsMiddleware = require('./middleware/metrics');

const apiGateway = require('../gateway/api-gateway');
const metricsRoutes = require('./routes/metrics');

const app = express();
app.use(requestId);
app.use(requestLogger);
app.use(responseFormatter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeMiddleware);
app.use(metricsMiddleware);
app.use((req, res, next) => {
  if (req.protocol === 'http' && config.nodeEnv === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
app.use(
  cors({
    origin: (origin, callback) => {
      if (config.isProduction && !origin) {
        return callback(new Error('CORS origin missing')); 
      }
      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!config.isProduction && !origin) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  }),
);
app.use(generalLimiter);

app.use('/api', apiGateway);
app.use('/metrics', metricsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

// start scheduled jobs
try {
  const boostExpiryJob = require('./jobs/boostExpiryJob');
  boostExpiryJob.start();
} catch (err) {
  console.warn('Failed to start boost expiry job', err.message);
}

module.exports = app;
