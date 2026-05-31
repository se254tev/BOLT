const authorizeAdmin = (allowedPermissions = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Admin authorization required', code: 'authorization_required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Insufficient privileges', code: 'insufficient_privileges' });
  }

  if (allowedPermissions.length > 0) {
    const tokenPermissions = Array.isArray(req.tokenPayload?.permissions) ? req.tokenPayload.permissions : [];
    const hasPermission = allowedPermissions.every((permission) => tokenPermissions.includes(permission));
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: 'Permission denied', code: 'permission_denied' });
    }
  }

  next();
};

module.exports = authorizeAdmin;
