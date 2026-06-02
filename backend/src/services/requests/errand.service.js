const { createRequest, REQUEST_TYPES } = require('./request.service');

const createErrandRequest = async ({ user, payload }) => {
  return createRequest({
    user,
    payload: {
      type: REQUEST_TYPES.ERRAND_REQUEST,
      taskDescription: payload.taskDescription,
      pickupLocation: payload.pickupLocation,
      attachments: payload.attachments || [],
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      budgetCurrency: payload.budgetCurrency || 'USD',
    },
  });
};

module.exports = {
  createErrandRequest,
};
