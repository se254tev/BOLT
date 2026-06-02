const workerService = require('../services/requests/worker.service');

const registerWorker = async (req, res) => {
  const worker = await workerService.registerWorker({ user: req.user, payload: req.validated });
  res.json({ worker });
};

const listAvailableWorkers = async (req, res) => {
  const { role, serviceType } = req.query;
  const workers = await workerService.listAvailableWorkers({ role, serviceType });
  res.json({ workers });
};

module.exports = {
  registerWorker,
  listAvailableWorkers,
};
