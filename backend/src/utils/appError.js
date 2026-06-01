/**
 * AppError Class - Standard error handling across Bolt platform
 * All backend errors MUST use this class or related utilities
 */

class AppError extends Error {
  constructor(errorDefinition, additionalContext = {}) {
    const { code, httpStatus, message } = errorDefinition;

    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.message = message;
    this.context = additionalContext;

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to API response format
   */
  toJSON() {
    return {
      success: false,
      code: this.code,
      message: this.message,
      status: this.httpStatus,
      ...(Object.keys(this.context).length && { context: this.context }),
    };
  }

  /**
   * Get HTTP status code
   */
  getStatus() {
    return this.httpStatus;
  }

  /**
   * Check if error is operational (expected error vs programmer error)
   */
  isOperational() {
    return true; // All AppErrors are operational by definition
  }
}

/**
 * Factory function for creating errors
 * @param {Object} errorDefinition - Error code from ERRORS constant
 * @param {Object} additionalContext - Optional context (user-facing data)
 * @returns {AppError}
 */
const createError = (errorDefinition, additionalContext = {}) => {
  return new AppError(errorDefinition, additionalContext);
};

/**
 * Validate error code exists
 * @param {Object} errorDefinition - Error definition to validate
 * @returns {boolean}
 */
const isValidError = (errorDefinition) => {
  return (
    errorDefinition &&
    errorDefinition.code &&
    errorDefinition.httpStatus &&
    errorDefinition.message
  );
};

module.exports = {
  AppError,
  createError,
  isValidError,
};
