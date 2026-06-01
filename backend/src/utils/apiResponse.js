/**
 * Standardized API Response Builder
 * All controllers MUST use these utilities for responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message: message || 'Request successful',
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Object|AppError} error - Error object or AppError
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const errorResponse = (res, error, statusCode = 500) => {
  // If error is AppError, use its properties
  if (error && error.code) {
    return res.status(error.httpStatus || statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      status: error.httpStatus || statusCode,
    });
  }

  // Fallback for generic Error objects
  return res.status(statusCode).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: error?.message || 'Something went wrong',
    status: statusCode,
  });
};

/**
 * Send paginated success response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Response message
 */
const paginatedResponse = (res, data = [], page = 1, limit = 10, total = 0, message = '') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    message: message || 'Request successful',
  });
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Response message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send accepted response (202)
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Response message
 */
const acceptedResponse = (res, data = null, message = 'Request accepted') => {
  return res.status(202).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  acceptedResponse,
  noContentResponse,
};
