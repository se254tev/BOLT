# Authentication & Account Creation Flow - Complete Analysis

## Executive Summary
This document provides a thorough analysis of the Bolt Marketplace authentication system across three layers:
1. **Backend** (Node.js/Express with MongoDB)
2. **Mobile** (Flutter with Riverpod)
3. **Admin Dashboard** (React/Vite)

---

## 1. BACKEND AUTHENTICATION SYSTEM

### 1.1 Entry Points & Routes

#### User Auth Routes
**File:** [backend/src/routes/auth.js](backend/src/routes/auth.js)
```javascript
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const validateRequest = require('../middleware/validate');
const sanitize = require('../middleware/sanitize');
const { authLimiter } = require('../middleware/rateLimit');
const { requireController } = require('../utils/requireController');
const authController = requireController('../controllers/authController');
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
```

**Endpoints:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset
- `POST /api/auth/verify-email` - Verify email address

#### Admin Auth Routes
**File:** [backend/src/routes/adminAuth.js](backend/src/routes/adminAuth.js)
```javascript
router.post('/login', adminAuthLimiter, validateRequest(schemas.loginSchema), adminAuthController.login);
router.post('/refresh', adminAuthLimiter, adminAuthController.refresh);
router.post('/logout', authenticateAdmin, adminAuthController.logout);
router.get('/me', authenticateAdmin, adminAuthController.me);

// MFA
router.post('/mfa/setup', authenticateAdmin, adminMfaController.setup);
router.post('/mfa/verify', authenticateAdmin, adminMfaController.verify);
router.post('/mfa/disable', authenticateAdmin, adminMfaController.disable);

// Sessions management
router.get('/sessions', authenticateAdmin, authorizeAdmin(['admins.manage']), adminAuthController.listSessions);
router.delete('/sessions/:id', authenticateAdmin, authorizeAdmin(['admins.manage']), adminAuthController.revokeSession);
router.delete('/sessions', authenticateAdmin, authorizeAdmin(['admins.manage']), adminAuthController.revokeAllSessions);
```

---

### 1.2 User Model & Database Schema

**File:** [backend/src/models/user.js](backend/src/models/user.js)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin', 'super_admin'], default: 'buyer' },
  profileImage: { type: String },
  permissions: { type: [String], default: [] },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  mfaTempSecret: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active' },
  tokenVersion: { type: Number, default: 0 },
  
  // Delivery agent fields
  rating: { type: Number, default: 5.0 },
  totalDeliveries: { type: Number, default: 0 },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  paymentMethods: {
    mpesaPhone: { type: String },
    mpesaTill: { type: String },
    mpesaPaybill: { type: String },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    accountName: { type: String },
    airtelMoneyNumber: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});
```

**User Types:**
| Role | Purpose | Default | Can Create Listings |
|------|---------|---------|-------------------|
| `buyer` | Regular customer | Yes | No |
| `seller` | Can list products/properties/restaurants | No | Yes |
| `admin` | Platform moderator | No | N/A |
| `super_admin` | Full platform control | No | N/A |

---

### 1.3 Input Validation Schema

**File:** [backend/src/schemas/auth.js](backend/src/schemas/auth.js)

```javascript
const { z } = require('zod');

const emailSchema = z.string().email({ message: 'Invalid email address.' });
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long.');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().min(7).max(20),
  role: z.enum(['buyer', 'seller']).default('buyer'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const refreshSchema = z.object({});
const emailSchemaOnly = z.object({ email: emailSchema });
const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
const verifyEmailSchema = z.object({ token: z.string().min(1) });

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  emailSchemaOnly,
  resetPasswordSchema,
  verifyEmailSchema,
};
```

**Validation Rules:**
- **Email:** Valid email format required
- **Password:** Minimum 8 characters
- **Name:** 2-100 characters
- **Phone:** 7-20 characters
- **Role:** Enum: `buyer`, `seller` (default: `buyer`)

---

### 1.4 Registration Controller Flow

**File:** [backend/src/controllers/authController.js](backend/src/controllers/authController.js)

```javascript
const register = async (req, res) => {
  const { name, email, password, phone, role } = req.validated;
  
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    const error = createError(ERRORS.EMAIL_ALREADY_REGISTERED);
    return errorResponse(res, error);
  }

  // Hash password (Argon2 primary, fallback to bcrypt)
  const hashedPassword = await hashPassword(password);
  
  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role,
    emailVerified: false,
    accountStatus: 'active',
  });

  // Generate email verification token
  const verificationToken = crypto.randomBytes(24).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  await user.save();

  // Create JWT tokens
  const { accessToken, refreshToken, refreshJti } = await createTokens(user);
  
  // Store refresh session in Redis
  await storeRefreshSession(user.id, refreshToken, refreshJti);

  // Set secure httpOnly cookie
  res.cookie(config.cookieName, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });

  // Return user (without password) and access token
  const responseUser = await User.findById(user.id).select('-password');
  return createdResponse(res, { accessToken, user: responseUser }, 'Registration successful');
};
```

**Registration Flow:**
1. Validate input against schema (Zod)
2. Check for duplicate email
3. Hash password using Argon2 (or bcrypt fallback)
4. Create user record with `role` field
5. Generate email verification token (24-hour expiry)
6. Create JWT tokens (access + refresh)
7. Store refresh token in Redis with TTL
8. Set secure httpOnly cookie
9. Return access token + user data

---

### 1.5 Login Controller Flow

```javascript
const login = async (req, res) => {
  const { email, password } = req.validated;
  
  // Find user by email
  const user = await User.findOne({ email });

  // Verify password
  if (!user || !(await comparePassword(password, user.password))) {
    const error = createError(ERRORS.INVALID_CREDENTIALS);
    return errorResponse(res, error);
  }

  // Prevent admin users from logging in through regular auth
  if (user.role === 'admin' || user.role === 'super_admin') {
    const error = createError(ERRORS.ADMIN_AUTH_REQUIRED);
    return errorResponse(res, error);
  }

  // Check account status
  if (user.suspended || user.accountStatus !== 'active') {
    const error = createError(ERRORS.ACCOUNT_DISABLED);
    return errorResponse(res, error);
  }

  // Create tokens
  const { accessToken, refreshToken, refreshJti } = await createTokens(user);
  await storeRefreshSession(user.id, refreshToken, refreshJti);

  // Set cookie and return tokens
  res.cookie(config.cookieName, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  const responseUser = await User.findById(user.id).select('-password');
  successResponse(res, { accessToken, user: responseUser }, 'Login successful');
};
```

---

### 1.6 Authentication Service & Token Management

**File:** [backend/src/services/authService.js](backend/src/services/authService.js)

```javascript
// Token Creation
const createTokens = async (user) => {
  const { token: accessToken, jti: accessJti } = signAccessToken(user.id, user.role, user.tokenVersion);
  const { token: refreshToken, jti: refreshJti } = signRefreshToken(user.id, user.role, user.tokenVersion);
  return { accessToken, accessJti, refreshToken, refreshJti };
};

// Access Token: 15 minutes
const signAccessToken = (userId, role, tokenVersion) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { id: userId, role, type: 'access', tokenVersion },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpiresIn, jwtid: jti }
  );
  return { token, jti };
};

// Refresh Token: 30 days
const signRefreshToken = (userId, role, tokenVersion) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { id: userId, role, type: 'refresh', tokenVersion },
    config.jwtSecret,
    { expiresIn: config.jwtRefreshExpiresIn, jwtid: jti }
  );
  return { token, jti };
};

// Password Hashing (Argon2 preferred, fallback to bcrypt)
const hashPassword = async (password) => {
  const argon2 = require('argon2');
  const bcrypt = require('bcryptjs');
  try {
    return await argon2.hash(password, { type: argon2.argon2id });
  } catch (err) {
    return bcrypt.hash(password, await bcrypt.genSalt(config.bcryptSaltRounds));
  }
};

// Password Comparison
const comparePassword = async (password, hash) => {
  const argon2 = require('argon2');
  const bcrypt = require('bcryptjs');
  if (hash.startsWith('$argon2')) {
    return argon2.verify(hash, password);
  }
  return bcrypt.compare(password, hash);
};
```

**Token Details:**
- **Access Token:** 15 minutes (short-lived, in Authorization header)
- **Refresh Token:** 30 days (long-lived, in httpOnly cookie)
- **JTI (JWT ID):** Unique identifier stored in Redis for revocation tracking
- **Token Version:** Invalidates all tokens when incremented (logout security)

---

### 1.7 Input Sanitization Middleware

**File:** [backend/src/middleware/sanitize.js](backend/src/middleware/sanitize.js)

```javascript
const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    Object.keys(obj).forEach((key) => {
      // Prevent NoSQL injection ($ and . characters)
      if (key.startsWith('$') || key.includes('.')) {
        return;
      }
      sanitized[key] = sanitizeInput(obj[key]);
    });
    return sanitized;
  }
  if (typeof obj === 'string') {
    // Remove all HTML tags
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
```

**Protection Against:**
- XSS (HTML tag removal)
- NoSQL injection ($ and . key filtering)
- Whitespace trimming

---

### 1.8 Validation Middleware

**File:** [backend/src/middleware/validate.js](backend/src/middleware/validate.js)

```javascript
const validateRequest = (schema) => (req, res, next) => {
  const { body, query, params } = req;
  const payload = { ...body, ...query, ...params };
  
  // Zod validation
  const parsed = schema.safeParse(payload);
  
  if (!parsed.success) {
    const error = createError(ERRORS.INVALID_REQUEST_DATA, { details: parsed.error.format() });
    return errorResponse(res, error);
  }
  
  // Store validated data
  req.validated = parsed.data;
  next();
};

module.exports = validateRequest;
```

---

### 1.9 Rate Limiting

**File:** [backend/src/middleware/rateLimit.js](backend/src/middleware/rateLimit.js)

```javascript
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  errorCode: ERRORS.LOGIN_RATE_LIMIT_EXCEEDED,
});

const generalLimiter = createLimiter({
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                   // 100 requests
  errorCode: ERRORS.RATE_LIMIT_EXCEEDED,
});

const sellerLimiter = createLimiter({
  windowMs: 60 * 1000,        // 1 minute
  max: 200,                   // Higher limit for sellers
  errorCode: ERRORS.SELLER_RATE_LIMIT_EXCEEDED,
});

const adminLimiter = createLimiter({
  windowMs: 60 * 1000,        // 1 minute
  max: 500,                   // Highest limit for admins
  errorCode: ERRORS.ADMIN_RATE_LIMIT_EXCEEDED,
});
```

**Limits:**
- **Auth endpoints:** 5 requests per 15 minutes
- **General API:** 100 requests per minute
- **Seller endpoints:** 200 requests per minute
- **Admin endpoints:** 500 requests per minute

---

### 1.10 Authentication Middleware

**File:** [backend/src/middleware/authenticate.js](backend/src/middleware/authenticate.js)

```javascript
const authenticate = async (req, res, next) => {
  // Get Bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: missing authorization header');
    const error = createError(ERRORS.AUTHENTICATION_REQUIRED);
    return errorResponse(res, error);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT signature and expiry
    const payload = jwt.verify(token, config.jwtSecret);

    // Check token type
    if (payload.type !== 'access') {
      const error = createError(ERRORS.INVALID_TOKEN);
      return errorResponse(res, error);
    }

    // Check if token revoked (blacklisted)
    if (await isAccessTokenRevoked(payload.jti)) {
      const error = createError(ERRORS.TOKEN_REVOKED);
      return errorResponse(res, error);
    }

    // Get user from DB
    const user = await User.findById(payload.id).select('-password');
    
    if (!user || user.suspended || user.accountStatus !== 'active') {
      const error = createError(ERRORS.ACCOUNT_DISABLED);
      return errorResponse(res, error);
    }

    // Check token version (invalidates all old tokens on logout)
    if (user.tokenVersion !== payload.tokenVersion) {
      const error = createError(ERRORS.SESSION_EXPIRED);
      return errorResponse(res, error);
    }

    // Attach user and token info to request
    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (err) {
    logger.warn('Authentication failed: invalid token');
    const error = createError(ERRORS.SESSION_EXPIRED);
    return errorResponse(res, error);
  }
};

module.exports = authenticate;
```

**Verification Steps:**
1. Extract Bearer token from Authorization header
2. Verify JWT signature using secret
3. Check token type = 'access'
4. Check JTI not in revocation list (Redis)
5. Verify user exists and is active
6. Verify token version matches user's current version
7. Attach user to request context

---

### 1.11 Authorization Middleware

**File:** [backend/src/middleware/authorize.js](backend/src/middleware/authorize.js)

```javascript
const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    const error = createError(ERRORS.AUTHORIZATION_REQUIRED);
    return errorResponse(res, error);
  }

  if (!allowedRoles.includes(req.user.role)) {
    const error = createError(ERRORS.INSUFFICIENT_PRIVILEGES);
    return errorResponse(res, error);
  }

  next();
};

module.exports = authorize;
```

**Usage Example:**
```javascript
// Only allow sellers to create products
router.post(
  '/products',
  authenticate,
  authorize(['seller']),
  productController.createProduct
);
```

---

### 1.12 Admin Authentication

**File:** [backend/src/controllers/adminAuthController.js](backend/src/controllers/adminAuthController.js)

**Admin Login Features:**
1. **Account Lockout:** 5 failed attempts = 15-minute lockout
2. **MFA Enforcement:** Optional 2FA with TOTP
3. **Session Tracking:** Store IP, User-Agent, device name
4. **Audit Logging:** All admin actions logged

```javascript
const login = async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Check account lockout
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    return res.status(403).json({ success: false, message: 'Account locked' });
  }

  // Verify password
  const passwordValid = await comparePassword(password, user.password);
  if (!passwordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
    }
    await user.save();
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Check if admin role
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }

  // Check if account active
  if (user.suspended || user.accountStatus !== 'active') {
    return res.status(403).json({ success: false, message: 'Account disabled' });
  }

  // MFA check
  if (user.mfaEnabled) {
    const mfaToken = req.validated.mfaToken;
    if (!mfaToken) {
      return res.status(428).json({ success: false, message: 'MFA token required' });
    }
    const secret = user.mfaSecret;
    const ok = otplib.authenticator.check(mfaToken, secret);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid MFA token' });
  }

  // Reset lockout counters
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  // Create tokens and session records
  const { accessToken, refreshToken, refreshJti } = await createAdminTokens(user);
  await storeRefreshSession(user.id, refreshToken, refreshJti);

  // Store session in DB with hash
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  const session = await AdminSession.create({
    adminId: user.id,
    jti: refreshJti,
    refreshTokenHash: refreshHash,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    deviceName: req.body.deviceName,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Audit logging
  await AuditLog.create({
    adminId: user.id,
    action: 'ADMIN_LOGIN',
    resource: 'admin',
    resourceId: user.id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.json({ success: true, data: { accessToken, admin: responseUser } });
};
```

---

## 2. FLUTTER MOBILE AUTHENTICATION UI

### 2.1 Login Page

**File:** [lib/features/auth/presentation/pages/login_page.dart](lib/features/auth/presentation/pages/login_page.dart)

```dart
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    // Listen for successful login
    ref.listen<AsyncValue<User?>>(authControllerProvider, (previous, next) {
      if (next is AsyncData<User?> && next.value != null) {
        if (mounted) context.go('/home');
      }
    });
  }

  Future<void> _onLoginPressed() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    try {
      await ref.read(authControllerProvider.notifier).login(
        _emailController.text.trim(),
        _passwordController.text,
      );
    } catch (_) {}
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: SizedBox(
          width: 480,
          child: AppCard(
            child: Form(
              key: _formKey,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    AppInput(
                      label: 'Email',
                      controller: _emailController,
                    ),
                    const SizedBox(height: 12),
                    AppInput(
                      label: 'Password',
                      controller: _passwordController,
                      obscure: true,
                    ),
                    const SizedBox(height: 20),
                    authState is AsyncLoading
                        ? const LoadingIndicator()
                        : AppButton(
                            label: 'Login',
                            onPressed: _isSubmitting ? null : _onLoginPressed,
                          ),
                    if (authState is AsyncError)
                      Text(authState.error.toString()),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => context.go('/register'),
                      child: const Text('Create an account'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### 2.2 Registration Page

**File:** [lib/features/auth/presentation/pages/register_page.dart](lib/features/auth/presentation/pages/register_page.dart)

```dart
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  void _onRegister() {
    if (!_formKey.currentState!.validate()) return;
    
    // 🔴 VULNERABILITY: Hardcoded role!
    ref.read(authControllerProvider.notifier).register(
      _nameController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text,
      _phoneController.text.trim(),
      'buyer',  // ⚠️ Always registers as buyer, no option for seller
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
                validator: (value) => value == null || value.isEmpty
                    ? 'Enter your full name'
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (value) => value == null || !Validators.isValidEmail(value)
                    ? 'Enter a valid email'
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
                validator: (value) => value == null || value.length < 8
                    ? 'Enter a valid phone number'
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
                validator: (value) => value == null || !Validators.isValidPassword(value)
                    ? 'Password must be 8+ characters'
                    : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _onRegister,
                child: const Text('Register'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**CRITICAL SECURITY ISSUE:**
- ⚠️ **Hardcoded Role:** Users can only register as `'buyer'`
- No UI option to select seller role during registration
- Sellers must be manually upgraded by admin or through other mechanism

---

### 2.3 Flutter Validators

**File:** [lib/core/utils/validators.dart](lib/core/utils/validators.dart)

```dart
class Validators {
  static bool isValidEmail(String email) {
    return RegExp(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
        .hasMatch(email);
  }

  static bool isValidPassword(String password) {
    return password.length >= 8;
  }
}
```

**Validation Rules:**
- **Email:** Basic regex pattern (allows common formats)
- **Password:** Minimum 8 characters (no complexity requirements)

---

### 2.4 Auth Controller (Riverpod)

**File:** [lib/features/auth/presentation/controllers/auth_controller.dart](lib/features/auth/presentation/controllers/auth_controller.dart)

```dart
final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<User?>>(
  (ref) => AuthController(ref),
);

class AuthController extends StateNotifier<AsyncValue<User?>> {
  final Ref ref;
  AuthController(this.ref) : super(const AsyncValue.data(null));

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await LoginUseCase(repository)(
        email: email,
        password: password,
      );
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> register(
    String name,
    String email,
    String password,
    String phone,
    String role,
  ) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await RegisterUseCase(repository)(
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: role,
      );
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}
```

---

### 2.5 Auth Repository Implementation

**File:** [lib/features/auth/data/repositories/auth_repository_impl.dart](lib/features/auth/data/repositories/auth_repository_impl.dart)

```dart
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final StorageService storageService;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.storageService,
  });

  @override
  Future<User> login({
    required String email,
    required String password,
  }) async {
    final resp = await remoteDataSource.login(email, password);
    final user = resp['user'];
    final access = resp['accessToken'];
    
    // Store JWT token in secure storage
    if (access != null) {
      await storageService.write('jwt_token', access);
    }
    return user;
  }

  @override
  Future<User> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String role,
  }) async {
    final resp = await remoteDataSource.register(
      name,
      email,
      password,
      phone,
      role,
    );
    final user = resp['user'];
    final access = resp['accessToken'];
    
    if (access != null) {
      await storageService.write('jwt_token', access);
    }
    return user;
  }

  @override
  Future<void> logout() async {
    await remoteDataSource.logout();
    await storageService.delete('jwt_token');
  }
}
```

---

### 2.6 Auth Remote Data Source

**File:** [lib/features/auth/data/datasources/auth_remote_data_source.dart](lib/features/auth/data/datasources/auth_remote_data_source.dart)

```dart
class AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSource(this.dio);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await dio.post(
      '${ApiEndpoints.auth}/login',
      data: {
        'email': email,
        'password': password,
      },
    );
    return {
      'user': UserModel.fromJson(response.data['data']['user']),
      'accessToken': response.data['data']['accessToken'],
    };
  }

  Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
    String phone,
    String role,
  ) async {
    final response = await dio.post(
      '${ApiEndpoints.auth}/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'role': role,
      },
    );
    return {
      'user': UserModel.fromJson(response.data['data']['user']),
      'accessToken': response.data['data']['accessToken'],
    };
  }

  Future<void> logout() async {
    await dio.post('${ApiEndpoints.auth}/logout');
  }
}
```

---

### 2.7 User Model (Dart)

**File:** [lib/features/auth/data/models/user_model.dart](lib/features/auth/data/models/user_model.dart)

```dart
class UserModel extends User {
  UserModel({
    required super.id,
    required super.name,
    required super.email,
    required super.phone,
    required super.role,
    super.profileImage,
    required super.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'buyer',
      profileImage: json['profileImage'],
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'profileImage': profileImage,
    };
  }
}
```

---

### 2.8 User Entity

**File:** [lib/features/auth/domain/entities/user.dart](lib/features/auth/domain/entities/user.dart)

```dart
class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;  // 'buyer', 'seller', 'admin'
  final String? profileImage;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.profileImage,
    required this.createdAt,
  });
}
```

---

## 3. SECURITY ANALYSIS & VULNERABILITIES

### 3.1 CRITICAL VULNERABILITIES

#### 🔴 1. No Seller Registration UI
**Severity:** CRITICAL  
**Location:** [lib/features/auth/presentation/pages/register_page.dart](lib/features/auth/presentation/pages/register_page.dart)

**Issue:**
```dart
// Hardcoded role - no choice for users
ref.read(authControllerProvider.notifier).register(
  _nameController.text.trim(),
  _emailController.text.trim(),
  _passwordController.text,
  _phoneController.text.trim(),
  'buyer',  // ⚠️ ALWAYS 'buyer'
);
```

**Impact:**
- Users can only self-register as buyers
- Cannot become sellers through normal registration flow
- Sellers must rely on manual admin approval/role assignment
- Potential revenue impact if seller adoption is hindered

**Recommendation:**
- Add UI toggle/radio button for role selection
- Add seller application/verification process
- Validate role selection on backend

---

#### 🔴 2. Weak Password Validation (Client-Side)
**Severity:** HIGH  
**Location:** [lib/core/utils/validators.dart](lib/core/utils/validators.dart)

**Issue:**
```dart
static bool isValidPassword(String password) {
  return password.length >= 8;  // ⚠️ Only checks length!
}
```

**Current Validation:** Length >= 8 only  
**Missing:**
- No uppercase letter requirement
- No lowercase letter requirement
- No numeric digit requirement
- No special character requirement
- No common password checking

**Backend Validation:** Same limitation in [backend/src/schemas/auth.js](backend/src/schemas/auth.js)
```javascript
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long.');
```

**Recommendation:**
```dart
static bool isValidPassword(String password) {
  return password.length >= 12 &&
         RegExp(r'[A-Z]').hasMatch(password) &&      // Uppercase
         RegExp(r'[a-z]').hasMatch(password) &&      // Lowercase
         RegExp(r'[0-9]').hasMatch(password) &&      // Digit
         RegExp(r'[!@#\$%^&*(),.?":{}|<>]').hasMatch(password); // Special char
}
```

---

#### 🔴 3. No Email Verification Enforcement
**Severity:** HIGH  
**Location:** [backend/src/controllers/authController.js](backend/src/controllers/authController.js)

**Issue:**
- Email verification token is generated but no enforcement
- Users can immediately use API after registration
- No endpoint checks `emailVerified` status
- Fake email registrations possible

**Code:**
```javascript
user.emailVerificationToken = verificationToken;
user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24;
await user.save();
// But token is never actually sent or checked during API calls
```

**Recommendation:**
- Enforce email verification before allowing API access
- Add middleware to check `emailVerified === true`
- Actually send verification email

---

#### 🔴 4. No HTTPS/TLS Enforcement in Flutter
**Severity:** HIGH  
**Location:** Mobile App Communication

**Missing Security:**
- No certificate pinning
- No HTTPS requirement enforcement
- Vulnerable to MITM attacks on unsecured networks
- No timeout configurations

**Recommendation:**
```dart
// Add certificate pinning
final httpClient = HttpClient()
  ..badCertificateCallback = (X509Certificate cert, String host, int port) => false;

final dio = Dio()
  ..httpClientAdapter = IOHttpClientAdapter(
    createHttpClient: () => httpClient,
  );
```

---

### 3.2 HIGH-SEVERITY VULNERABILITIES

#### 🟠 1. Email Enumeration Attack
**Severity:** HIGH  
**Location:** [backend/src/controllers/authController.js](backend/src/controllers/authController.js)

**Issue:**
```javascript
const existing = await User.findOne({ email });
if (existing) {
  const error = createError(ERRORS.EMAIL_ALREADY_REGISTERED);
  return errorResponse(res, error);
}
```

**Attack:**
- Attacker can enumerate valid emails
- Different error messages for existing vs non-existing emails
- Can be used to build contact lists

**Fix:** Return same message for all registration failures
```javascript
const existing = await User.findOne({ email });
if (existing) {
  // Don't specify "email already registered"
  return errorResponse(res, { message: 'Registration failed. Please try again.' });
}
```

---

#### 🟠 2. No CORS Validation Bypass
**Severity:** MEDIUM-HIGH  
**Location:** [backend/src/app.js](backend/src/app.js)

**Concern:**
```javascript
// CORS configuration might be too permissive
app.use(corsMiddleware);
app.options('*', corsMiddleware);
```

**Need to verify:** backend/src/middleware/cors.js for actual configuration

---

#### 🟠 3. Weak Token Revocation
**Severity:** MEDIUM  
**Location:** [backend/src/middleware/authenticate.js](backend/src/middleware/authenticate.js)

**Issue:**
- Relies on Redis for token blacklist
- If Redis crashes, revocation is bypassed
- No fallback mechanism

**Code:**
```javascript
if (await isAccessTokenRevoked(payload.jti)) {
  // What if Redis is down?
}
```

**Recommendation:**
- Add database-level revocation check as fallback
- Implement circuit breaker pattern

---

### 3.3 MEDIUM-SEVERITY VULNERABILITIES

#### 🟡 1. Insufficient Session Timeout
**Severity:** MEDIUM  
**Location:** Token configuration

**Issue:**
- Refresh token valid for 30 days
- If device is stolen, attacker has 30 days access

**Recommendation:**
- Reduce refresh token expiry to 7-14 days
- Implement device fingerprinting
- Track session activity and force re-auth on suspicious activity

---

#### 🟡 2. No Rate Limiting on Password Reset
**Severity:** MEDIUM  
**Location:** [backend/src/routes/auth.js](backend/src/routes/auth.js)

**Issue:**
```javascript
router.post(
  '/forgot-password',
  validateRequest(schemas.emailSchemaOnly),
  authController.forgotPassword  // ⚠️ No rate limiter!
);
```

**Attack:** Brute-force email addresses to trigger spam

**Fix:**
```javascript
router.post(
  '/forgot-password',
  authLimiter,  // Add rate limiter
  validateRequest(schemas.emailSchemaOnly),
  authController.forgotPassword
);
```

---

#### 🟡 3. Generic Error Messages Needed
**Severity:** MEDIUM  
**Location:** All auth endpoints

**Current Issues:**
- Some endpoints may reveal if email exists
- Password reset reveals token validity
- Different error handling inconsistent

**Recommendation:**
- Standardize error responses
- Use generic messages for failures
- Log detailed errors server-side only

---

### 3.4 LOW-SEVERITY ISSUES

#### 🟢 1. Unnecessary User Role Exposure
**Severity:** LOW  
**Location:** API responses

**Issue:**
- User role returned in responses
- Could expose seller/admin status

**Fix:**
```javascript
// Audit: When returning user, exclude sensitive fields
const responseUser = await User.findById(user.id)
  .select('-password -permissions -mfaSecret');
```

---

## 4. POSITIVE SECURITY FEATURES

### ✅ 1. Strong Password Hashing
- Primary: Argon2 (memory-hard, resistant to GPU attacks)
- Fallback: bcrypt (10 salt rounds)
- Handles both hash types on comparison

### ✅ 2. Token Revocation System
- JTI-based revocation tracking
- Redis-backed token blacklist
- Token version invalidation on logout

### ✅ 3. Input Sanitization
- HTML tag removal
- NoSQL injection prevention ($ and . filtering)
- All inputs validated with Zod

### ✅ 4. Admin Account Lockout
- 5 failed attempts → 15-minute lockout
- Prevents brute-force attacks on admin accounts

### ✅ 5. Secure Cookies
- httpOnly flag (prevents JS access)
- Secure flag (HTTPS only in production)
- SameSite: strict (CSRF protection)

### ✅ 6. MFA Support
- TOTP-based 2FA for admins
- Optional but available

### ✅ 7. Audit Logging
- Admin actions logged
- IP and User-Agent tracked

---

## 5. DATA FLOW DIAGRAMS

### 5.1 Registration Flow
```
┌─────────────────────────┐
│   Flutter Mobile App    │
│  (register_page.dart)   │
└──────────────┬──────────┘
               │ POST /register
               │ {name, email, password, phone, role:'buyer'}
               ▼
┌─────────────────────────────────────────────────┐
│     Backend Express Server                      │
│  1. Sanitize input (sanitize.js)                │
│  2. Validate schema (Zod, validate.js)          │
│  3. Check duplicate email                       │
│  4. Hash password (Argon2)                      │
│  5. Create User in MongoDB                      │
│  6. Generate email verification token           │
│  7. Create JWT tokens (access + refresh)        │
│  8. Store refresh session in Redis              │
│  9. Set httpOnly cookie                         │
│ 10. Return access token + user data             │
└──────────────┬──────────────────────────────────┘
               │ {accessToken, user}
               ▼
┌──────────────────────────┐
│   Flutter Mobile App     │
│ 1. Store JWT in secure   │
│    storage (StorageService)
│ 2. Update auth state     │
│    (authControllerProvider)
│ 3. Navigate to /home     │
└──────────────────────────┘
```

### 5.2 Login Flow
```
┌───────────────────┐
│  Flutter App      │
│  (login_page)     │
└────────┬──────────┘
         │ POST /login
         │ {email, password}
         ▼
┌────────────────────────────────────┐
│   Backend Controller               │
│ 1. Find user by email              │
│ 2. Compare password (bcrypt/Argon2)
│ 3. Check role != admin             │
│ 4. Check not suspended             │
│ 5. Create tokens                   │
│ 6. Store refresh session           │
│ 7. Set secure cookie               │
└────────┬───────────────────────────┘
         │ {accessToken, user}
         ▼
┌──────────────────────┐
│   Flutter Storage    │
│ Save JWT token       │
│ Update auth state    │
└──────────────────────┘
```

### 5.3 API Request Flow (with Authentication)
```
┌──────────────────────┐
│   Flutter App        │
│ GET /api/products    │
│ Header: Bearer TOKEN │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Backend Middleware Chain           │
│ 1. Extract Bearer token              │
│ 2. Verify JWT signature              │
│ 3. Check token type = 'access'       │
│ 4. Check JTI not revoked (Redis)     │
│ 5. Get user from DB                  │
│ 6. Check token version               │
│ 7. Verify user active/not suspended  │
│ 8. Attach req.user                   │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────┐
│   Route Handler      │
│ Access req.user      │
│ Process request      │
└──────────────────────┘
```

---

## 6. FILE MANIFEST

### Backend Authentication Files
| File | Purpose | Security Focus |
|------|---------|--------|
| [backend/src/routes/auth.js](backend/src/routes/auth.js) | Auth route definitions | Rate limiting, middleware chain |
| [backend/src/routes/adminAuth.js](backend/src/routes/adminAuth.js) | Admin-only routes | MFA, session tracking |
| [backend/src/controllers/authController.js](backend/src/controllers/authController.js) | Auth logic (register, login) | Password hashing, token creation |
| [backend/src/controllers/adminAuthController.js](backend/src/controllers/adminAuthController.js) | Admin auth logic | MFA, lockout, audit logging |
| [backend/src/models/user.js](backend/src/models/user.js) | MongoDB schema | User types, verification tokens |
| [backend/src/schemas/auth.js](backend/src/schemas/auth.js) | Zod validation | Input validation rules |
| [backend/src/services/authService.js](backend/src/services/authService.js) | Token/crypto utilities | JWT creation, password hashing |
| [backend/src/middleware/authenticate.js](backend/src/middleware/authenticate.js) | JWT verification | Token validation, revocation |
| [backend/src/middleware/authorize.js](backend/src/middleware/authorize.js) | Role-based access | Permission checking |
| [backend/src/middleware/sanitize.js](backend/src/middleware/sanitize.js) | Input sanitization | XSS, NoSQL injection prevention |
| [backend/src/middleware/validate.js](backend/src/middleware/validate.js) | Request validation | Schema validation |
| [backend/src/middleware/rateLimit.js](backend/src/middleware/rateLimit.js) | Rate limiting | Brute-force protection |

### Flutter Mobile Files
| File | Purpose | Security Focus |
|------|---------|--------|
| [lib/features/auth/presentation/pages/login_page.dart](lib/features/auth/presentation/pages/login_page.dart) | Login UI | Form validation, async handling |
| [lib/features/auth/presentation/pages/register_page.dart](lib/features/auth/presentation/pages/register_page.dart) | Registration UI | 🔴 Hardcoded role |
| [lib/features/auth/presentation/controllers/auth_controller.dart](lib/features/auth/presentation/controllers/auth_controller.dart) | State management | Riverpod provider |
| [lib/features/auth/data/datasources/auth_remote_data_source.dart](lib/features/auth/data/datasources/auth_remote_data_source.dart) | API communication | HTTP requests to backend |
| [lib/features/auth/data/repositories/auth_repository_impl.dart](lib/features/auth/data/repositories/auth_repository_impl.dart) | Repository pattern | Token storage |
| [lib/features/auth/domain/repositories/auth_repository.dart](lib/features/auth/domain/repositories/auth_repository.dart) | Interface | Contract |
| [lib/features/auth/domain/entities/user.dart](lib/features/auth/domain/entities/user.dart) | Domain model | User entity |
| [lib/features/auth/data/models/user_model.dart](lib/features/auth/data/models/user_model.dart) | Data model | JSON mapping |
| [lib/core/utils/validators.dart](lib/core/utils/validators.dart) | Validation utilities | 🟡 Weak password rules |

---

## 7. USER TYPE DIFFERENTIATION MECHANISM

### 7.1 How Buyers vs Sellers are Created

**During Registration:**
```javascript
const registerSchema = z.object({
  role: z.enum(['buyer', 'seller']).default('buyer'),
});
```

**Backend accepts:** `'buyer'` or `'seller'`  
**Flutter sends:** Always `'buyer'` (hardcoded)

### 7.2 How Roles Are Used

**Endpoint Protection:**
```javascript
// Only sellers can create products
router.post('/products',
  authenticate,
  authorize(['seller']),  // ✅ Role check
  productController.createProduct
);
```

**Rate Limits by Role:**
```javascript
sellerLimiter: 200 req/min
generalLimiter: 100 req/min
```

**Admin-Only Endpoints:**
```javascript
if (user.role === 'admin' || user.role === 'super_admin') {
  // Only admin access
}
```

### 7.3 Role Promotion Mechanism

**From Buyer to Seller:**
- Manual admin assignment (no API exposed in code)
- Update user `role` field to `'seller'`
- Possibly requires seller application/KYC verification (not shown in code)

---

## 8. RECOMMENDATIONS

### IMMEDIATE ACTIONS (CRITICAL)

1. **Add Seller Registration UI**
   - Add radio buttons/toggle for user type selection
   - Implement seller verification workflow
   - Require seller approval before accessing features

2. **Strengthen Password Policy**
   - Require minimum 12 characters
   - Enforce uppercase, lowercase, numbers, special chars
   - Check against common password lists

3. **Enforce Email Verification**
   - Block API access until email verified
   - Implement email sending (currently not done)
   - Add resend verification endpoint

4. **Add HTTPS/Certificate Pinning**
   - Implement SSL pinning in Flutter
   - Require HTTPS in production

### SHORT-TERM ACTIONS (HIGH PRIORITY)

5. Fix email enumeration attack
6. Add rate limiting to password reset
7. Reduce refresh token expiry (30 → 14 days)
8. Add device fingerprinting
9. Implement suspicious login detection

### LONG-TERM IMPROVEMENTS

10. Add passwordless authentication (WebAuthn)
11. Implement social login (Google, Apple)
12. Add account recovery codes (2FA backup)
13. Implement behavioral analytics for fraud detection
14. Add session activity dashboard for users

---

## 9. SUMMARY TABLE

| Component | Status | Severity |
|-----------|--------|----------|
| Password Hashing (Argon2) | ✅ Secure | N/A |
| Token Management | ✅ Secure | N/A |
| Input Sanitization | ✅ Implemented | N/A |
| Rate Limiting | ✅ Implemented | N/A |
| Seller Registration UI | 🔴 Missing | **CRITICAL** |
| Password Validation Rules | 🟡 Weak | **HIGH** |
| Email Verification Enforcement | 🔴 Missing | **HIGH** |
| HTTPS/Pinning | 🔴 Missing | **HIGH** |
| Email Enumeration Protection | 🔴 Missing | **HIGH** |
| Password Reset Rate Limiting | 🔴 Missing | **MEDIUM** |
| Session Timeout | 🟡 Long | **MEDIUM** |
| Token Revocation Fallback | 🟡 Weak | **MEDIUM** |

---

**Document Generated:** 2026-06-02  
**Scope:** Bolt Marketplace v1.1  
**Reviewer:** Security Audit Team
