/**
 * Centralized Error Handler for React Admin Dashboard
 * Maps backend error codes to user-friendly messages
 */

export const ERROR_CODES = {
  // Authentication
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Authorization
  AUTHORIZATION_REQUIRED: 'AUTHORIZATION_REQUIRED',
  INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ADMIN_ACCESS_REQUIRED: 'ADMIN_ACCESS_REQUIRED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',

  // User/Entity Errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  ADMIN_NOT_FOUND: 'ADMIN_NOT_FOUND',

  // Validation
  INVALID_REQUEST_DATA: 'INVALID_REQUEST_DATA',
  INVALID_IDENTIFIER: 'INVALID_IDENTIFIER',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  ADMIN_RATE_LIMIT_EXCEEDED: 'ADMIN_RATE_LIMIT_EXCEEDED',

  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
};

/**
 * Get user-friendly error message
 * @param {string} code - Error code from backend
 * @param {object} context - Optional error context
 * @returns {string} User-friendly message
 */
export const getErrorMessage = (code, context = {}) => {
  switch (code) {
    // Authentication errors
    case ERROR_CODES.AUTHENTICATION_REQUIRED:
    case ERROR_CODES.INVALID_TOKEN:
    case ERROR_CODES.TOKEN_REVOKED:
      return 'Please log in again';

    case ERROR_CODES.SESSION_EXPIRED:
    case ERROR_CODES.INVALID_REFRESH_TOKEN:
      return 'Your session has expired. Please log in again';

    case ERROR_CODES.INVALID_CREDENTIALS:
      return 'Invalid email or password';

    // Authorization errors
    case ERROR_CODES.AUTHORIZATION_REQUIRED:
      return 'Authorization required';

    case ERROR_CODES.INSUFFICIENT_PRIVILEGES:
    case ERROR_CODES.PERMISSION_DENIED:
      return 'You do not have permission for this action';

    case ERROR_CODES.ADMIN_ACCESS_REQUIRED:
      return 'Admin access required';

    case ERROR_CODES.ACCOUNT_DISABLED:
      return 'Your account has been disabled';

    // Not found errors
    case ERROR_CODES.USER_NOT_FOUND:
      return 'User not found';

    case ERROR_CODES.PRODUCT_NOT_FOUND:
      return 'Product not found';

    case ERROR_CODES.ORDER_NOT_FOUND:
      return 'Order not found';

    case ERROR_CODES.PAYMENT_NOT_FOUND:
      return 'Payment record not found';

    case ERROR_CODES.ADMIN_NOT_FOUND:
      return 'Admin user not found';

    // Validation errors
    case ERROR_CODES.INVALID_REQUEST_DATA:
      return 'Invalid request data';

    case ERROR_CODES.INVALID_IDENTIFIER:
      return 'Invalid identifier';

    // Rate limiting
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return 'Too many requests. Please try again later';

    case ERROR_CODES.ADMIN_RATE_LIMIT_EXCEEDED:
      return 'Admin rate limit exceeded. Please wait and try again';

    // Server errors
    case ERROR_CODES.INTERNAL_SERVER_ERROR:
      return 'Something went wrong. Please try again later';

    case ERROR_CODES.NOT_FOUND:
      return 'Resource not found';

    default:
      return 'An error occurred. Please try again';
  }
};

/**
 * Map API error response to standardized error object
 * @param {object} errorResponse - Error response from API
 * @returns {object} Standardized error object
 */
export const mapApiError = (errorResponse) => {
  if (!errorResponse) {
    return {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: getErrorMessage(ERROR_CODES.INTERNAL_SERVER_ERROR),
      statusCode: 500,
    };
  }

  const { code, message, status } = errorResponse;

  return {
    code: code || ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: message || getErrorMessage(code),
    statusCode: status || 500,
    displayMessage: getErrorMessage(code),
  };
};

/**
 * Check if error requires re-authentication
 * @param {string} code - Error code
 * @returns {boolean}
 */
export const requiresReauth = (code) => {
  return [
    ERROR_CODES.AUTHENTICATION_REQUIRED,
    ERROR_CODES.INVALID_TOKEN,
    ERROR_CODES.TOKEN_REVOKED,
    ERROR_CODES.SESSION_EXPIRED,
    ERROR_CODES.INVALID_REFRESH_TOKEN,
  ].includes(code);
};

/**
 * Check if error is a rate limit error
 * @param {string} code - Error code
 * @returns {boolean}
 */
export const isRateLimit = (code) => {
  return [
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    ERROR_CODES.ADMIN_RATE_LIMIT_EXCEEDED,
  ].includes(code);
};

/**
 * Check if error is retriable
 * @param {string} code - Error code
 * @returns {boolean}
 */
export const isRetriable = (code) => {
  return [
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    ERROR_CODES.ADMIN_RATE_LIMIT_EXCEEDED,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
  ].includes(code);
};

/**
 * Get error severity level
 * @param {number} statusCode - HTTP status code
 * @returns {string} Severity: 'error' | 'warning' | 'info'
 */
export const getErrorSeverity = (statusCode) => {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warning';
  return 'info';
};

/**
 * Error notification handler
 * Use this in API interceptors and catch blocks
 * @param {object} error - Error object
 * @param {function} notifyFn - Notification function (e.g., toast)
 */
export const handleApiError = (error, notifyFn) => {
  const errorData = error?.response?.data;
  const mapped = mapApiError(errorData);

  if (requiresReauth(mapped.code)) {
    // Redirect to login or refresh auth
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return;
  }

  if (notifyFn) {
    const severity = getErrorSeverity(mapped.statusCode);
    notifyFn({
      type: severity,
      message: mapped.displayMessage,
      code: mapped.code,
    });
  }

  return mapped;
};
