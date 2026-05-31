const AuditLog = require('../models/auditLog');

const auditMiddleware = async (req, res, next) => {
  const requestId = req.requestId;
  const startTime = Date.now();
  res.on('finish', async () => {
    try {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        await AuditLog.create({
          adminId: req.user?.id,
          action: `${req.method} ${req.originalUrl}`,
          resource: req.originalUrl,
          status: res.statusCode,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          requestId,
          durationMs: Date.now() - startTime,
        });
      }
    } catch (err) {
      // avoid leaking audit write failures to clients
      console.warn('Audit log write failed', err.message);
    }
  });
  next();
};

module.exports = { auditMiddleware };
