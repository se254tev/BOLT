const { ServiceRequest, ServiceBid, ServiceAssignment } = require('./models');
const { getWorkerByUserId } = require('./worker.service');
const {
  emitToUser,
  emitToWorker,
  emitToRequestRoom,
  emitToAdmins,
} = require('./realtime.gateway');
const Notification = require('../../models/notification');
const ERRORS = require('../../constants/errorCodes');
const { createError } = require('../../utils/appError');

const createBid = async ({ user, payload }) => {
  const worker = await getWorkerByUserId(user.id || user._id);
  if (!worker) throw createError(ERRORS.NOT_A_REGISTERED_WORKER);

  const serviceRequest = await ServiceRequest.findById(payload.requestId);
  if (!serviceRequest) throw createError(ERRORS.SERVICE_REQUEST_NOT_FOUND);
  const roleMatchesRequest = (serviceRequest.requestType === 'RIDE_REQUEST' && worker.role === 'RIDER')
    || (serviceRequest.requestType === 'ERRAND_REQUEST' && worker.role === 'SHOPPER');

  if (!roleMatchesRequest) {
    throw createError(ERRORS.INVALID_BID_ACTION, { message: 'Worker role does not match the request type' });
  }

  if ([ 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED' ].includes(serviceRequest.requestState)) {
    throw createError(ERRORS.INVALID_REQUEST_STATE_TRANSITION, { state: serviceRequest.requestState });
  }

  if (serviceRequest.requestState === 'OPEN') {
    serviceRequest.requestState = 'BIDDING';
  }

  const bid = await ServiceBid.create({
    requestId: serviceRequest._id,
    workerId: worker._id,
    userId: user.id || user._id,
    price: payload.price,
    message: payload.message,
    status: 'OPEN',
  });

  serviceRequest.bidIds = serviceRequest.bidIds || [];
  serviceRequest.bidIds.push(bid._id);
  await serviceRequest.save();

  emitToUser(String(serviceRequest.userId), 'bid_received', {
    requestId: serviceRequest._id,
    bidId: bid._id,
    price: bid.price,
    message: bid.message,
  });
  emitToWorker(String(worker._id), 'bid_submitted', {
    requestId: serviceRequest._id,
    bidId: bid._id,
  });
  emitToAdmins('bid_submitted', { requestId: serviceRequest._id, bidId: bid._id, price: bid.price, workerId: worker._id });

  await Notification.create({
    userId: serviceRequest.userId,
    title: 'New bid received',
    body: `A worker submitted a bid for your request ${serviceRequest._id}.`,
    data: { requestId: serviceRequest._id, bidId: bid._id },
  });

  return bid;
};

const selectBid = async ({ user, payload }) => {
  const bid = await ServiceBid.findById(payload.bidId);
  if (!bid) throw createError(ERRORS.BID_NOT_FOUND);

  const serviceRequest = await ServiceRequest.findById(bid.requestId);
  if (!serviceRequest) throw createError(ERRORS.SERVICE_REQUEST_NOT_FOUND);
  if (String(serviceRequest.userId) !== String(user.id || user._id)) {
    throw createError(ERRORS.REQUEST_FORBIDDEN);
  }

  if (![ 'OPEN', 'BIDDING' ].includes(serviceRequest.requestState)) {
    throw createError(ERRORS.INVALID_REQUEST_STATE_TRANSITION, { state: serviceRequest.requestState });
  }

  bid.status = 'SELECTED';
  await bid.save();

  const otherBids = await ServiceBid.find({
    requestId: serviceRequest._id,
    _id: { $ne: bid._id },
    status: 'OPEN',
  });

  await Promise.all(otherBids.map(async (otherBid) => {
    otherBid.status = 'REJECTED';
    await otherBid.save();
    emitToWorker(String(otherBid.workerId), 'request_rejected', {
      requestId: serviceRequest._id,
      bidId: otherBid._id,
    });
    await Notification.create({
      userId: otherBid.userId,
      title: 'Bid not selected',
      body: `Your bid for request ${serviceRequest._id} was not selected.`,
      data: { requestId: serviceRequest._id, bidId: otherBid._id },
    });
  }));

  const assignment = await ServiceAssignment.create({
    requestId: serviceRequest._id,
    bidId: bid._id,
    workerId: bid.workerId,
    userId: serviceRequest.userId,
    status: 'ASSIGNED',
  });

  serviceRequest.assignmentId = assignment._id;
  serviceRequest.selectedBidId = bid._id;
  serviceRequest.assignedWorkerId = bid.workerId;
  serviceRequest.requestState = 'ASSIGNED';
  await serviceRequest.save();

  emitToWorker(String(bid.workerId), 'bid_selected', {
    requestId: serviceRequest._id,
    bidId: bid._id,
    assignmentId: assignment._id,
  });
  emitToRequestRoom(serviceRequest._id, 'request_assigned', {
    requestId: serviceRequest._id,
    assignmentId: assignment._id,
    workerId: bid.workerId,
  });
  emitToAdmins('request_assigned', { requestId: serviceRequest._id, assignmentId: assignment._id, workerId: bid.workerId });

  await Notification.create({
    userId: bid.userId,
    title: 'Bid selected',
    body: `Your bid for request ${serviceRequest._id} has been selected.`,
    data: { requestId: serviceRequest._id, assignmentId: assignment._id },
  });

  await Notification.create({
    userId: serviceRequest.userId,
    title: 'Worker assigned',
    body: `A worker was selected for your request ${serviceRequest._id}.`,
    data: { requestId: serviceRequest._id, assignmentId: assignment._id },
  });

  return assignment;
};

const listBidsForRequest = async ({ requestId, user }) => {
  const serviceRequest = await ServiceRequest.findById(requestId);
  if (!serviceRequest) throw createError(ERRORS.SERVICE_REQUEST_NOT_FOUND);

  const isOwner = String(serviceRequest.userId) === String(user.id || user._id);
  if (isOwner) {
    return ServiceBid.find({ requestId }).sort({ createdAt: -1 });
  }

  const worker = await getWorkerByUserId(user.id || user._id);
  if (!worker) throw createError(ERRORS.NOT_A_REGISTERED_WORKER);

  return ServiceBid.find({ requestId, workerId: worker._id }).sort({ createdAt: -1 });
};

module.exports = {
  createBid,
  selectBid,
  listBidsForRequest,
};
