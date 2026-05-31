const logger = require('../services/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error %s %s %o', req.method, req.originalUrl, {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });

  const status = err.status || 500;
  const response = {
    success: false,
    message: status === 500 ? 'Something went wrong' : err.message,
    code: err.code || (status === 500 ? 'internal_error' : 'request_error'),
    requestId: req.requestId,
  };

  res.status(status).json(response);
};

module.exports = errorHandler;
