# DETAILED AUTHENTICATION FLOW ANALYSIS

**Document Purpose:** Deep dive into account creation, user registration, and authentication security

---

## BACKEND AUTHENTICATION (`backend/src/`)

### Files Overview
- **Routes:** `routes/auth.js`, `routes/adminAuth.js`
- **Controllers:** `controllers/authController.js`, `controllers/adminAuthController.js`
- **Models:** `models/user.js`
- **Schemas:** `schemas/auth.js` (Zod validation)
- **Services:** `services/authService.js`
- **Middleware:** `middleware/authenticate.js`, `middleware/authorize.js`, `middleware/sanitize.js`

---

## REGISTRATION FLOW - COMPLETE ANALYSIS

### 1. Frontend Entry Point
**File:** `lib/features/auth/presentation/pages/register_page.dart`

```dart
// User enters:
1. Email: "user@example.com"
2. Password: "password123"     // ❌ WEAK - only 8 chars needed
3. Full Name: "John Doe"
4. Phone Number: "+254712345678"

// Form validates:
- Email: RegExp pattern
- Password: length >= 8          // ⚠️ Too lenient
- Full Name: !empty
- Phone: length >= 8

// Then calls: AuthRepository.register(...)
```

**Validation Code:**
```dart
class Validators {
  static bool isValidEmail(String email) {
    return RegExp(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        .hasMatch(email);
  }

  static bool isValidPassword(String password) {
    return password.length >= 8;  // ❌ CRITICAL: Accepts "12345678"
  }
}
```

### 2. API Request
**Endpoint:** `POST /api/auth/register`

```javascript
// HTTP Request
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+254712345678"
}
```

### 3. Middleware Chain

#### Middleware 1: Sanitization
**File:** `backend/src/middleware/sanitize.js`

```javascript
app.use(sanitizeMiddleware);

// Does:
1. Check all keys in request for '$' and '.'
2. Remove HTML tags from string values
3. Reject dangerous patterns

// Example:
Input:  {email: "<script>alert(1)</script>", password: {$ne: null}}
Output: {email: "alert(1)", password: null}  // Rejected - contains $
```

#### Middleware 2: Rate Limiting
**File:** `backend/src/middleware/rateLimit.js`

```javascript
// Rate limits applied
router.post('/register',
  rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                     // 5 requests per window
    message: 'Too many registration attempts'
  }),
  controller
);
```

#### Middleware 3: Input Validation
**File:** `backend/src/schemas/auth.js`

```javascript
import { z } from 'zod';

const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255),
  
  fullName: z
    .string()
    .min(1, 'Full name required')
    .max(100),
  
  phoneNumber: z
    .string()
    .min(8, 'Phone must be at least 8 characters')
    .max(20)
});

// Usage:
const validated = registerSchema.parse(req.body);
// Throws if invalid
```

### 4. Controller Logic
**File:** `backend/src/controllers/authController.js`

```javascript
export async function register(req, res, next) {
  try {
    const { email, password, fullName, phoneNumber } = req.body;
    
    // Validate schema
    const validated = registerSchema.parse({
      email: email.toLowerCase(),  // Normalize
      password,
      fullName,
      phoneNumber
    });
    
    // Check duplicate email
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password with Argon2
    const hashedPassword = await hashPassword(password);
    
    // Create user with BUYER role
    const user = new User({
      email: validated.email,
      password: hashedPassword,
      fullName: validated.fullName,
      phoneNumber: validated.phoneNumber,
      role: 'buyer',              // ⚠️ ALWAYS buyer
      emailVerified: false,        // ❌ Not enforced
      isSuspended: false,
      tokenVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await user.save();
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Store refresh token in Redis for revocation
    await redis.set(
      `token:${user._id}:${user.tokenVersion}`,
      refreshToken,
      'EX',
      30 * 24 * 60 * 60  // 30 days
    );
    
    // Set httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    return res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
    
  } catch (error) {
    next(error);
  }
}
```

### 5. User Model in Database
**File:** `backend/src/models/user.js`

```javascript
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  password: {
    type: String,
    required: true,
    minlength: 60  // Argon2 hashed length
  },
  
  fullName: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  phoneNumber: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 20
  },
  
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin', 'super_admin', 'delivery_agent'],
    default: 'buyer',
    required: true
  },
  
  emailVerified: {
    type: Boolean,
    default: false  // ❌ Not enforced
  },
  
  isSuspended: {
    type: Boolean,
    default: false
  },
  
  tokenVersion: {
    type: Number,
    default: 1  // Used for logout all
  },
  
  // MFA for admins
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  
  mfaSecret: String,  // Encrypted
  
  backupCodes: [String],  // Encrypted
  
  // Payment methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['mpesa', 'bank_transfer', 'card']
    },
    reference: String,  // Phone number, account, card last 4
    verified: Boolean
  }],
  
  // Session tracking
  activeSessions: [{
    jti: String,
    createdAt: Date,
    expiresAt: Date,
    ipAddress: String,
    userAgent: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

---

## PASSWORD HASHING - ARGON2 ANALYSIS

### Hashing Function
**File:** `backend/src/services/authService.js`

```javascript
import argon2 from 'argon2';

export async function hashPassword(password) {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,         // ✅ Recommended type
      memoryCost: 19 * 1024,         // ✅ 19 MB
      timeCost: 2,                   // ✅ 2 iterations
      parallelism: 1,
      rawLength: 32,
      encoding: 'utf8',
      hashLength: 32
    });
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

export async function verifyPassword(password, hashedPassword) {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    throw new Error('Password verification failed');
  }
}
```

### Security Assessment
- ✅ **Algorithm:** Argon2id (resistance to GPU/ASIC attacks)
- ✅ **Memory:** 19 MB (industry recommended: 19-512 MB)
- ✅ **Time:** 2 iterations (fine for user registration)
- ✅ **Salt:** Auto-generated by Argon2
- ✅ **No Plain Text:** Never stored or logged

### Vulnerability: Weak Password Policy
- ❌ **Minimum Length:** 8 characters
- ❌ **No Complexity:** Accepts "12345678" or "password"
- ❌ **No History:** Can reuse old passwords
- ❌ **No Expiry:** Passwords valid forever

**Examples of Accepted Passwords:**
- ✅ "12345678"
- ✅ "qwertyui"
- ✅ "password"
- ✅ "aaaaaaaa"

---

## LOGIN FLOW

### Endpoint: `POST /api/auth/login`

```javascript
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validated = loginSchema.parse({
      email: email.toLowerCase(),
      password
    });
    
    // Find user
    const user = await User.findOne({ email: validated.email });
    
    if (!user) {
      // ⚠️ SECURITY: Email enumeration possible
      // Should respond same for non-existent user
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if suspended
    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    // Verify password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);  // 15 min
        await user.save();
        return res.status(429).json({ error: 'Too many failed attempts' });
      }
      
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Store in Redis
    await redis.set(
      `token:${user._id}:${user.tokenVersion}`,
      refreshToken,
      'EX',
      30 * 24 * 60 * 60
    );
    
    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    
    return res.status(200).json({ accessToken, user: { ...user.toJSON() } });
    
  } catch (error) {
    next(error);
  }
}
```

### Security Features
- ✅ Account lockout after 5 failed attempts (15 min)
- ✅ Case-insensitive email
- ✅ Generic error message (doesn't reveal email existence)
- ✅ Rate limiting (5/15 min on auth endpoint)
- ✅ HttpOnly cookie for refresh token

### Vulnerabilities
- ⚠️ **Email Enumeration:** Different response times might leak email existence
- ⚠️ **No MFA for Users:** Only optional for admins
- ❌ **30-Day Refresh Token:** Too long expiry

---

## TOKEN SYSTEM

### JWT Structure

```javascript
// Access Token (15 minutes)
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "buyer",
  "tokenVersion": 1,
  "iat": 1234567890,
  "exp": 1234567890 + 900  // 15 minutes
}

// Refresh Token (30 days)
{
  "userId": "507f1f77bcf86cd799439011",
  "tokenVersion": 1,
  "iat": 1234567890,
  "exp": 1234567890 + 2592000  // 30 days
}
```

### Token Revocation Mechanism

```javascript
// On logout:
user.tokenVersion++;
await user.save();

// All existing tokens with old version become invalid
// When verifying token: check if token.version === user.tokenVersion
```

### Redis Storage

```
Key:   token:507f1f77bcf86cd799439011:1
Value: <refreshToken>
TTL:   2592000 (30 days)

// On token refresh:
// 1. Verify refresh token signature
// 2. Check Redis has this token
// 3. If Redis missing → token revoked
// 4. Issue new access token
```

### Vulnerability: Redis Dependency
- 🔴 **Critical:** If Redis unavailable, token revocation disabled
- ⚠️ **Fallback:** None - token revocation fails silently
- **Impact:** Logout stops working, compromised tokens can't be revoked

---

## AUTHENTICATION MIDDLEWARE

### File: `backend/src/middleware/authenticate.js`

```javascript
export async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }
    
    const token = authHeader.slice(7);
    
    // Verify signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check version (logout revocation)
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ error: 'Token revoked' });
    }
    
    // Check suspension
    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    // Attach to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    };
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Usage

```javascript
// All protected routes use middleware
router.post('/api/products',
  authenticate,          // Verify token
  validateSchema,        // Zod validation
  authController.create
);
```

---

## EMAIL VERIFICATION - NOT IMPLEMENTED ❌

### Problem: Unverified Emails Can Perform Operations

```javascript
// ❌ Current behavior:
1. User registers → emailVerified = false
2. User receives JWT immediately
3. User can create products, orders, reviews
4. emailVerified never checked in routes

// ✅ Recommended behavior:
1. User registers → emailVerified = false
2. Email verification link sent
3. Operations blocked until emailVerified = true
4. Resend link after 24 hours
```

### Implementation Needed

```javascript
// Add email verification route
POST /api/auth/send-verification-email
POST /api/auth/verify-email?token=xxxx

// Middleware to check
export async function verifyEmail(req, res, next) {
  if (!req.user.emailVerified) {
    return res.status(403).json({ error: 'Email not verified' });
  }
  next();
}

// Apply to sensitive operations
router.post('/api/products', authenticate, verifyEmail, createProduct);
router.post('/api/orders', authenticate, verifyEmail, createOrder);
```

---

## ADMIN AUTHENTICATION

### Admin Registration - NO SELF-SIGNUP

```javascript
// Endpoint: PRIVATE (super_admin only)
POST /api/admin/auth/create-admin
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "role": "admin"
}

// Only super_admin can create other admins
```

### Admin MFA - TOTP (Authenticator App)

```javascript
// 1. Enable MFA
POST /api/admin/auth/mfa/setup
Response: {
  "secret": "JBSWY3DPEBLW64TMMQ",
  "qrCode": "data:image/png;base64,..."
}

// 2. Confirm with OTP
POST /api/admin/auth/mfa/verify
{
  "otp": "123456",
  "secret": "JBSWY3DPEBLW64TMMQ"
}

// 3. On each login:
POST /api/admin/auth/login-mfa
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "otp": "123456"  // Required if MFA enabled
}
```

### Admin Session Tracking

```javascript
{
  _id: ObjectId,
  adminId: ObjectId,
  hashedRefreshToken: "argon2...",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  createdAt: Date,
  expiresAt: Date,
  lastActivity: Date,
  loginMethod: "password" | "mfa"
}
```

---

## SECURITY VULNERABILITIES RANKED

### 🔴 CRITICAL

1. **Email Verification Not Enforced**
   - Users can operate without email confirmation
   - Recovery emails not validated
   - Password reset emails might go to wrong person
   - **Fix:** Block operations until verified

2. **Weak Password Policy**
   - 8 chars sufficient
   - Accepts "12345678"
   - No complexity requirements
   - No password strength meter
   - **Fix:** Require uppercase, number, symbol; min 12 chars

3. **Email Enumeration Possible**
   - Login endpoint might have timing differences
   - Attacker can enumerate valid emails
   - **Fix:** Constant-time comparison, same response for all failures

4. **No MFA for Regular Users**
   - Only optional for admins
   - Account takeover possible with password alone
   - **Fix:** Optional 2FA for users, required for sellers

5. **30-Day Refresh Token Expiry**
   - Stolen token valid for 30 days
   - Attacker has persistent access
   - **Fix:** Reduce to 7 days, implement rotation

### 🟠 HIGH

6. **Redis Optional for Token Revocation**
   - If Redis unavailable, logout doesn't work
   - Compromised tokens can't be revoked
   - **Fix:** Mandatory Redis or fallback

7. **No Account Lockout Across Sessions**
   - Failed login counter per attempt
   - Distributed attack possible
   - **Fix:** Centralized failed attempt tracking

8. **Unencrypted Sensitive Data in Logs**
   - Password attempts logged before hashing?
   - **Fix:** Never log passwords or tokens

9. **No HTTPS Certificate Pinning (Mobile)**
   - Flutter app vulnerable to MITM
   - Attacker can intercept JWT tokens
   - **Fix:** Implement certificate pinning

### 🟡 MEDIUM

10. **No Rate Limiting on Password Reset**
    - Attacker can spam reset links
    - **Fix:** Rate limit: 3/hour per email

---

## COMPLIANCE CHECKLIST

- [ ] OWASP Top 10 - Password Complexity
- [ ] OWASP Top 10 - Email Verification
- [ ] GDPR - Data Deletion on Request
- [ ] PCI DSS - Payment Method Security
- [ ] NIST - Password Requirements
- [ ] ISO 27001 - Information Security

---

## TESTING RECOMMENDATIONS

### Manual Tests

```bash
# Test 1: Weak password acceptance
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "12345678",
    "fullName": "Test",
    "phoneNumber": "1234567890"
  }'
# Expected: Reject (actual: Accepted) ❌

# Test 2: SQL injection
curl -X POST http://localhost:3000/api/auth/login \
  -d 'email={$ne: null}&password=x'
# Expected: Sanitized, rejected
# Actual: Removed $ from key ✅

# Test 3: Rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/register ...
done
# Expected: 6th fails with 429
# Actual: ? (Test required)

# Test 4: Token revocation on logout
1. Login → get accessToken
2. Call logout
3. Try to use accessToken
# Expected: 401 Token revoked
# Actual: ? (Test required)
```

### Automated Tests

- [ ] Unit tests: Password hashing
- [ ] Unit tests: Token generation
- [ ] Integration tests: Full registration flow
- [ ] Integration tests: Login with various passwords
- [ ] Integration tests: Token expiry
- [ ] Security tests: Brute force protection
- [ ] Security tests: Email enumeration
- [ ] Security tests: CSRF on state changes

---

## AUDIT TRAIL FOR AUTH OPERATIONS

### Logged Events
- ✅ User registration (email, IP)
- ✅ Admin login (email, IP, user-agent, MFA result)
- ✅ Failed login attempts (email, IP)
- ✅ Admin account lockout (email, duration)
- ✅ MFA changes (enabled/disabled, admin email)
- ✅ Password reset requests (email, result)

### NOT Logged
- ❌ Failed password reset attempts
- ❌ Token refresh operations
- ❌ Logout events
- ❌ Password change operations

---

## RECOMMENDATIONS - PRIORITY ORDER

### Today (1 Day)
1. Enforce email verification before operations
2. Strengthen password policy to 12+ chars with complexity

### This Week (3-5 Days)
3. Fix email enumeration (constant-time response)
4. Reduce refresh token to 7 days
5. Add password reset rate limiting

### Next 2 Weeks
6. Implement optional 2FA for users
7. Add audit log API for security team
8. Implement certificate pinning (mobile)
9. Separate JWT secrets for user/admin

### Long-term
10. Implement password history (no reuse)
11. Add passwordless auth (WebAuthn)
12. Implement risk-based authentication (unusual location alerts)

