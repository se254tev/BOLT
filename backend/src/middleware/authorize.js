const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authorization required', code: 'authorization_required' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient privileges', code: 'insufficient_privileges' });
  }

  next();
};

module.exports = authorize;
