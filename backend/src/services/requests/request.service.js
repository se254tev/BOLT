const Notification = require('../../models/notification');
const { ServiceRequest, ServiceBid, ServiceWorker, ServiceAssignment, ServiceReview } = require('./models');
const { getWorkerByUserId, findAvailableWorkers } = require('./worker.service');
const {
  emitToUser,
  emitToWorkerRole,
  emitToWorker,
  emitToRequestRoom,
} = require('./realtime.gateway');
const ERRORS = require('../../constants/errorCodes');
const { createError } = require('../../utils/appError');

const REQUEST_TYPES = {
  MARKETPLACE_ORDER: 'MARKETPLACE_ORDER',
  RIDE_REQUEST: 'RIDE_REQUEST',
  ERRAND_REQUEST: 'ERRAND_REQUEST',
};

const REQUEST_STATES = {
  OPEN: 'OPEN',
  BIDDING: 'BIDDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REVIEWED: 'REVIEWED',
};

const WORKER_ROLES = {
  RIDER: 'RIDER',
  SHOPPER: 'SHOPPER',
};

const createRequest = async ({ user, payload }) => {
  const requestType = payload.type;
  const rideDetails = requestType === REQUEST_TYPES.RIDE_REQUEST ? {
    pickupLocation: payload.pickupLocation,
    destination: payload.destination,
    name: payload.name,
    phoneNumber: payload.phoneNumber,
    selfieUrl: payload.selfieUrl,
    landmarkUrl: payload.landmarkUrl,
    serviceType: payload.serviceType,
  } : undefined;

  const errandDetails = requestType === REQUEST_TYPES.ERRAND_REQUEST ? {
    taskDescription: payload.taskDescription,
    pickupLocation: payload.pickupLocation,
    attachments: payload.attachments || [],
    budgetMin: payload.budgetMin,
    budgetMax: payload.budgetMax,
    budgetCurrency: payload.budgetCurrency || 'USD',
  } : undefined;

  const serviceRequest = await ServiceRequest.create({
    requestType,
    userId: user.id || user._id,
    rideDetails,
    errandDetails,
    requestState: REQUEST_STATES.OPEN,
  });

  const workerRole = requestType === REQUEST_TYPES.RIDE_REQUEST ? WORKER_ROLES.RIDER : WORKER_ROLES.SHOPPER;
  await broadcastRequest(serviceRequest, workerRole);
  emitToUser(user.id || user._id, 'request_created', { requestId: serviceRequest._id, requestState: serviceRequest.requestState });

  return serviceRequest;
};

const broadcastRequest = async (serviceRequest, workerRole) => {
  const workers = await findAvailableWorkers({ role: workerRole });
  const notificationPayload = {
    title: `New ${serviceRequest.requestType === REQUEST_TYPES.RIDE_REQUEST ? 'ride' : 'errand'} request available`,
    body: 'A new request has been posted for your service type.',
    data: { requestId: serviceRequest._id, requestType: serviceRequest.requestType },
  };

  await Promise.all(workers.map((worker) => Notification.create({
    userId: worker.userId,
    title: notificationPayload.title,
    body: notificationPayload.body,
    data: notificationPayload.data,
  })));

  emitToWorkerRole(workerRole, 'request_broadcast', {
    requestId: serviceRequest._id,
    requestType: serviceRequest.requestType,
    requestState: serviceRequest.requestState,
    rideDetails: serviceRequest.rideDetails,
    errandDetails: serviceRequest.errandDetails,
  });
};

const getRequestById = async (id) => {
  return ServiceRequest.findById(id)
    .populate('assignedWorkerId', 'role profileImage serviceType phoneNumber')
    .populate('selectedBidId')
    .populate('assignmentId');
};

const getRequestsByUser = async (userId) => {
  return ServiceRequest.find({ userId }).sort({ createdAt: -1 });
};

const createReview = async ({ user, payload }) => {
  const { requestId, rating, comment } = payload;
  const serviceRequest = await ServiceRequest.findById(requestId);
  if (!serviceRequest) throw createError(ERRORS.SERVICE_REQUEST_NOT_FOUND);
  if (String(serviceRequest.userId) !== String(user.id || user._id)) {
    throw createError(ERRORS.REQUEST_FORBIDDEN);
  }
  if (![REQUEST_STATES.ASSIGNED, REQUEST_STATES.IN_PROGRESS, REQUEST_STATES.COMPLETED].includes(serviceRequest.requestState)) {
    throw createError(ERRORS.INVALID_REQUEST_STATE_TRANSITION, { state: serviceRequest.requestState });
  }

  const assignment = await ServiceAssignment.findById(serviceRequest.assignmentId);
  if (!assignment) {
    throw createError(ERRORS.INVALID_BID_ACTION, { message: 'Request is not assigned to a worker yet' });
  }

  const review = await ServiceReview.create({
    requestId: serviceRequest._id,
    assignmentId: assignment._id,
    workerId: assignment.workerId,
    userId: user.id || user._id,
    rating,
    comment,
  });

  serviceRequest.requestState = REQUEST_STATES.REVIEWED;
  await serviceRequest.save();

  assignment.status = 'REVIEWED';
  assignment.reviewedAt = new Date();
  await assignment.save();

  emitToRequestRoom(serviceRequest._id, 'request_completed', {
    requestId: serviceRequest._id,
    assignmentId: assignment._id,
    reviewId: review._id,
  });
  emitToWorker(String(assignment.workerId), 'request_completed', {
    requestId: serviceRequest._id,
    reviewId: review._id,
  });

  const worker = await ServiceWorker.findById(assignment.workerId);
  await Notification.create({
    userId: worker ? worker.userId : assignment.workerId,
    title: 'Request completed and reviewed',
    body: `Your assignment for request ${serviceRequest._id} has been reviewed.`,
    data: { requestId: serviceRequest._id, reviewId: review._id },
  });

  return review;
};

const getRequestIfAccessible = async ({ requestId, user }) => {
  const serviceRequest = await ServiceRequest.findById(requestId);
  if (!serviceRequest) throw createError(ERRORS.SERVICE_REQUEST_NOT_FOUND);
  if (String(serviceRequest.userId) === String(user.id || user._id)) {
    return serviceRequest;
  }
  const worker = await getWorkerByUserId(user.id || user._id);
  if (!worker) throw createError(ERRORS.NOT_A_REGISTERED_WORKER);
  const bid = await ServiceBid.findOne({ requestId, workerId: worker._id });
  if (!bid) throw createError(ERRORS.REQUEST_FORBIDDEN);
  return serviceRequest;
};

module.exports = {
  REQUEST_TYPES,
  REQUEST_STATES,
  WORKER_ROLES,
  createRequest,
  broadcastRequest,
  getRequestById,
  getRequestsByUser,
  createReview,
  getRequestIfAccessible,
};
