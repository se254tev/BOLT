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
app.use(requestId);
app.use(requestLogger);
app.use(responseFormatter);

// parse JSON/urlencoded early
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debug logging for CORS/preflight troubleshooting (temporary)
app.use((req, res, next) => {
  console.log('ORIGIN:', req.headers.origin);
  console.log('METHOD:', req.method, req.path);
  next();
});

// CORS must run before any authentication/redirect middleware
app.use(corsMiddleware);
app.options('*', corsOptions ? require('cors')(corsOptions) : (req, res) => res.sendStatus(204));

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

// Do NOT redirect OPTIONS preflight requests; only redirect non-OPTIONS http traffic
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS' && req.protocol === 'http' && config.nodeEnv === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

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
