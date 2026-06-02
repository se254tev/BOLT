const { createRequest, REQUEST_TYPES } = require('./request.service');

const createRideRequest = async ({ user, payload }) => {
  return createRequest({
    user,
    payload: {
      type: REQUEST_TYPES.RIDE_REQUEST,
      pickupLocation: payload.pickupLocation,
      destination: payload.destination,
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      selfieUrl: payload.selfieUrl,
      landmarkUrl: payload.landmarkUrl,
      serviceType: payload.serviceType,
    },
  });
};

module.exports = {
  createRideRequest,
};
