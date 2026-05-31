const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const validateRequest = require('../middleware/validate');
const sanitize = require('../middleware/sanitize');
const { adminAuthLimiter } = require('../middleware/rateLimit');
const adminAuthController = require('../controllers/adminAuthController');
const adminMfaController = require('../controllers/adminMfaController');
const schemas = require('../schemas/auth');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const authorizeAdmin = require('../middleware/authorizeAdmin');

router.use(cookieParser());
router.use(sanitize.sanitizeMiddleware);

router.post('/login', adminAuthLimiter, validateRequest(schemas.loginSchema), adminAuthController.login);
router.post('/refresh', adminAuthLimiter, adminAuthController.refresh);
router.post('/logout', authenticateAdmin, adminAuthController.logout);

// MFA
router.post('/mfa/setup', authenticateAdmin, adminMfaController.setup);
router.post('/mfa/verify', authenticateAdmin, adminMfaController.verify);
router.post('/mfa/disable', authenticateAdmin, adminMfaController.disable);

// Sessions management
router.get('/sessions', authenticateAdmin, authorizeAdmin(['admins.manage']), adminAuthController.listSessions);
router.delete('/sessions/:id', authenticateAdmin, authorizeAdmin(['admins.manage']), adminAuthController.revokeSession);
router.delete('/sessions', authenticateAdmin, authorizeAdmin(['admins.manage']), adminAuthController.revokeAllSessions);

module.exports = router;
