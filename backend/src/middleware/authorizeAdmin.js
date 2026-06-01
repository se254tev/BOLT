const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const authorizeAdmin = (allowedPermissions = []) => (req, res, next) => {
  if (!req.user) {
    const error = createError(ERRORS.AUTHORIZATION_REQUIRED);
    return errorResponse(res, error);
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    const error = createError(ERRORS.INSUFFICIENT_PRIVILEGES);
    return errorResponse(res, error);
  }

  if (allowedPermissions.length > 0) {
    const tokenPermissions = Array.isArray(req.tokenPayload?.permissions) ? req.tokenPayload.permissions : [];
    const hasPermission = allowedPermissions.every((permission) => tokenPermissions.includes(permission));
    if (!hasPermission) {
      const error = createError(ERRORS.PERMISSION_DENIED);
      return errorResponse(res, error);
    }
  }

  next();
};

module.exports = authorizeAdmin;
