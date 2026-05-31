const morgan = require('morgan');
const logger = require('../services/logger');

morgan.token('id', (req) => req.requestId);

const requestLogger = morgan(":method :url :status :res[content-length] - :response-time ms :id", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

module.exports = requestLogger;
