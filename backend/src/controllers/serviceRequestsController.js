const requestService = require('../services/requests/request.service');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');

const createRequest = async (req, res) => {
  const request = await requestService.createRequest({ user: req.user, payload: req.validated });
  res.json({ request });
};

const getRequest = async (req, res) => {
  const request = await requestService.getRequestById(req.params.id);
  if (!request) throw createError(ERRORS.SERVICE_REQUEST_NOT_FOUND);
  if (String(request.userId) !== String(req.user.id || req.user._id)) {
    throw createError(ERRORS.REQUEST_FORBIDDEN);
  }
  res.json({ request });
};

const getUserRequests = async (req, res) => {
  if (String(req.params.id) !== String(req.user.id || req.user._id)) {
    throw createError(ERRORS.REQUEST_FORBIDDEN);
  }
  const requests = await requestService.getRequestsByUser(req.params.id);
  res.json({ requests });
};

module.exports = {
  createRequest,
  getRequest,
  getUserRequests,
};
