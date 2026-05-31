const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const validateRequest = require('../middleware/validate');
const sanitize = require('../middleware/sanitize');
const { authLimiter } = require('../middleware/rateLimit');
const authController = require('../controllers/authController');
const schemas = require('../schemas/auth');

router.use(cookieParser());
router.use(sanitize.sanitizeMiddleware);
router.post('/register', authLimiter, validateRequest(schemas.registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(schemas.loginSchema), authController.login);
router.post('/refresh', validateRequest(schemas.refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validateRequest(schemas.emailSchemaOnly), authController.forgotPassword);
router.post('/reset-password', validateRequest(schemas.resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validateRequest(schemas.verifyEmailSchema), authController.verifyEmail);

module.exports = router;
