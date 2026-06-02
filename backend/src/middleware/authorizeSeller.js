const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const authorizeSeller = () => async (req, res, next) => {
  if (!req.user) {
    const error = createError(ERRORS.AUTHORIZATION_REQUIRED);
    return errorResponse(res, error);
  }

  if (req.user.role !== 'seller' || req.user.sellerStatus !== 'active') {
    const error = createError(ERRORS.INSUFFICIENT_PRIVILEGES);
    return errorResponse(res, error);
  }

  return next();
};

module.exports = authorizeSeller;
