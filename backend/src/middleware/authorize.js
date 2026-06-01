const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    const error = createError(ERRORS.AUTHORIZATION_REQUIRED);
    return errorResponse(res, error);
  }

  if (!allowedRoles.includes(req.user.role)) {
    const error = createError(ERRORS.INSUFFICIENT_PRIVILEGES);
    return errorResponse(res, error);
  }

  next();
};

module.exports = authorize;
