const logger = require('../services/logger');
const { AppError } = require('../utils/appError');
const ERRORS = require('../constants/errorCodes');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error %s %s %o', req.method, req.originalUrl, {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });

  // If it's an AppError, use its properties
  if (err instanceof AppError) {
    return res.status(err.httpStatus).json({
      success: false,
      code: err.code,
      message: err.message,
      status: err.httpStatus,
      requestId: req.requestId,
    });
  }

  // Fallback for generic errors
  const status = err.status || 500;
  const errorDef = status === 500 ? ERRORS.INTERNAL_SERVER_ERROR : ERRORS.INVALID_REQUEST_DATA;

  res.status(status).json({
    success: false,
    code: errorDef.code,
    message: errorDef.message,
    status,
    requestId: req.requestId,
  });
};

module.exports = errorHandler;
