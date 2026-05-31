const path = require('path');
const { createLogger, format, transports } = require('winston');

const logFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'bolt-api' },
  transports: [
    new transports.File({ filename: path.resolve(__dirname, '../../logs/error.log'), level: 'error' }),
    new transports.File({ filename: path.resolve(__dirname, '../../logs/security.log'), level: 'warn' }),
    new transports.File({ filename: path.resolve(__dirname, '../../logs/access.log'), level: 'info' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
