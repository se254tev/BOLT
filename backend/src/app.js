const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { corsMiddleware, corsOptions } = require('./middleware/cors');
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
app.set('trust proxy', 1);
app.use(requestId);
app.use(requestLogger);
app.use(responseFormatter);

// parse JSON/urlencoded early
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debug logging for Render + CORS troubleshooting (temporary)
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  console.log('Protocol:', req.protocol);
  console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
  console.log('Origin:', req.headers.origin);
  next();
});

// CORS must run before any authentication middleware
app.use(corsMiddleware);
app.options('*', corsMiddleware);

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
app.use(sanitizeMiddleware);
app.use(metricsMiddleware);

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
