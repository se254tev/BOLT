const metricsService = require('../services/metricsService');

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    metricsService.observeRequest(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      },
      seconds + nanoseconds / 1e9,
    );
  });
  next();
};

module.exports = metricsMiddleware;
