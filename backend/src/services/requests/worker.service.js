const { ServiceWorker } = require('./models');
const ERRORS = require('../../constants/errorCodes');
const { createError } = require('../../utils/appError');

const registerWorker = async ({ user, payload }) => {
  const workerData = {
    userId: user.id || user._id,
    role: payload.role,
    phoneNumber: payload.phoneNumber,
    profileImage: payload.profileImage,
    serviceType: payload.serviceType,
    legalDocumentUrl: payload.legalDocumentUrl,
    minPrice: payload.minPrice || 0,
    maxPrice: payload.maxPrice || 0,
    availabilityStatus: payload.availabilityStatus || 'AVAILABLE',
  };

  let worker = await ServiceWorker.findOne({ userId: workerData.userId });
  if (worker) {
    worker.set(workerData);
    await worker.save();
  } else {
    worker = await ServiceWorker.create(workerData);
  }

  return worker;
};

const getWorkerByUserId = async (userId) => {
  if (!userId) return null;
  return ServiceWorker.findOne({ userId });
};

const findAvailableWorkers = async ({ role, serviceType }) => {
  const query = { availabilityStatus: 'AVAILABLE' };
  if (role) query.role = role;
  if (serviceType) query.serviceType = serviceType;
  return ServiceWorker.find(query).lean();
};

const listAvailableWorkers = async ({ role, serviceType }) => {
  return ServiceWorker.find({ availabilityStatus: 'AVAILABLE', ...(role ? { role } : {}), ...(serviceType ? { serviceType } : {}) });
};

module.exports = {
  registerWorker,
  getWorkerByUserId,
  findAvailableWorkers,
  listAvailableWorkers,
};
