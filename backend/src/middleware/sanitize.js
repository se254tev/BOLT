const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    Object.keys(obj).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        return;
      }
      sanitized[key] = sanitizeInput(obj[key]);
    });
    return sanitized;
  }
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }
  return obj;
};

const sanitizeMiddleware = (req, res, next) => {
  req.body = sanitizeInput(req.body || {});
  req.query = sanitizeInput(req.query || {});
  req.params = sanitizeInput(req.params || {});
  next();
};

module.exports = { sanitizeMiddleware, sanitizeInput };
