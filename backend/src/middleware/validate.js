const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');

const validateRequest = (schema) => (req, res, next) => {
  const { body, query, params } = req;
  const payload = { ...body, ...query, ...params };
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const error = createError(ERRORS.INVALID_REQUEST_DATA, { details: parsed.error.format() });
    return errorResponse(res, error);
  }
  req.validated = parsed.data;
  next();
};

module.exports = validateRequest;
