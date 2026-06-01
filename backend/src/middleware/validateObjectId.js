const mongoose = require('mongoose');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = createError(ERRORS.INVALID_IDENTIFIER);
    return errorResponse(res, error);
  }
  next();
};

module.exports = validateObjectId;
