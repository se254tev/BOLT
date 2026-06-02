const bidService = require('../services/requests/bid.service');
const ERRORS = require('../constants/errorCodes');
const { createError } = require('../utils/appError');

const createBid = async (req, res) => {
  const bid = await bidService.createBid({ user: req.user, payload: req.validated });
  res.json({ bid });
};

const selectBid = async (req, res) => {
  const assignment = await bidService.selectBid({ user: req.user, payload: req.validated });
  res.json({ assignment });
};

const listBidsForRequest = async (req, res) => {
  const bids = await bidService.listBidsForRequest({ requestId: req.params.id, user: req.user });
  res.json({ bids });
};

module.exports = {
  createBid,
  selectBid,
  listBidsForRequest,
};
