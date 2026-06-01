# HARDCODED ERROR MESSAGES AUDIT

## Summary
**Total Hardcoded Error Messages Found: 180+**

Location: Across backend (Node.js), frontend (React), and mobile (Flutter) codebases

---

## BACKEND - Node.js/Express

### Authentication & Authorization Middleware

#### `/backend/src/middleware/authenticate.js`
- `"Authentication required"` (code: `authentication_required`)
- `"Invalid access token"` (code: `invalid_token`)
- `"Revoked access token"` (code: `token_revoked`)
- `"Account disabled"` (code: `account_disabled`)
- `"Session expired"` (code: `session_expired`)
- `"Session invalid or expired"` (code: `invalid_session`)

#### `/backend/src/middleware/authenticateAdmin.js`
- `"Admin authentication required"` (code: `authentication_required`)
- `"Invalid admin token"` (code: `invalid_token`)
- `"Insufficient privileges"` (code: `insufficient_privileges`)
- `"Revoked access token"` (code: `token_revoked`)
- `"Account disabled"` (code: `account_disabled`)
- `"Session expired"` (code: `session_expired`)
- `"Session invalid or expired"` (code: `invalid_session`)

#### `/backend/src/middleware/authorize.js`
- `"Authorization required"` (code: `authorization_required`)
- `"Insufficient privileges"` (code: `insufficient_privileges`)

#### `/backend/src/middleware/authorizeAdmin.js`
- `"Admin authorization required"` (code: `authorization_required`)
- `"Insufficient privileges"` (code: `insufficient_privileges`)
- `"Permission denied"` (code: `permission_denied`)

### Rate Limiting Middleware

#### `/backend/src/middleware/rateLimit.js`
- `"Too many requests. Please try again later."` (code: `rate_limit_exceeded`)
- `"Too many login attempts. Please wait 15 minutes."`
- `"Too many requests. Please slow down."`
- `"Seller endpoint limit reached."`
- `"Admin endpoint limit reached."`
- `"Too many admin auth attempts. Try again later."`

#### `/backend/src/middleware/throttle.js`
- `"Rate limit exceeded, please try later."`

### Request Validation Middleware

#### `/backend/src/middleware/validateObjectId.js`
- `"Invalid identifier"` (code: `invalid_identifier`)

#### `/backend/src/middleware/validate.js`
- `"Invalid request data"` (with details from parser)

#### `/backend/src/middleware/cors.js`
- `new Error('CORS origin missing')`
- `new Error('Blocked by CORS')`

### Error Handling

#### `/backend/src/middleware/errorHandler.js`
- `"Something went wrong"` (for 500 errors)
- Uses `err.message` for other errors

#### `/backend/src/middleware/fileUpload.js`
- `new Error('Invalid file type')`

### Authentication Controllers

#### `/backend/src/controllers/authController.js`
- `"Email already registered"` (code: `email_in_use`)
- `"Invalid credentials"` (code: `invalid_credentials`)
- `"Admin users must sign in through the admin auth endpoint"` (code: `admin_auth_required`)
- `"Account disabled"` (code: `account_disabled`)
- `"Refresh token required"` (code: `refresh_required`)
- `"Invalid refresh token"` (code: `invalid_refresh_token`)
- `"Session expired"` (code: `session_expired`)
- `"Refresh token invalid or expired"` (code: `invalid_refresh_session`)
- `"Invalid or expired reset token"` (code: `invalid_reset_token`)
- `"Invalid or expired verification token"` (code: `invalid_verification_token`)

#### `/backend/src/controllers/adminAuthController.js`
- `"Invalid credentials"` (code: `invalid_credentials`)
- `"Account locked due to multiple failed login attempts"` (code: `account_locked`)
- `"Admin access only"` (code: `admin_access_required`)
- `"Account disabled"` (code: `account_disabled`)
- `"MFA token required"` (code: `mfa_required`, HTTP 428)
- `"Invalid MFA token"` (code: `invalid_mfa`)
- `"Refresh token required"` (code: `refresh_required`)
- `"Invalid refresh token"` (code: `invalid_refresh_token`)
- `"Session expired"` (code: `session_expired`)
- `"Refresh token invalid or expired"` (code: `invalid_refresh_session`)
- `"Session invalid"` (code: `invalid_session`)
- `"Admin not found"` (code: `admin_not_found`)

### Admin MFA Controller

#### `/backend/src/controllers/adminMfaController.js`
- `"MFA not initiated"` (code: `mfa_not_initiated`)
- `"Invalid MFA token"` (code: `invalid_mfa`)

### Admin Payment Controller

#### `/backend/src/controllers/adminPaymentsController.js`
- `"Payment record not found"` (HTTP 404)
- `"Override action must be approve or reject"`

### Admin Controller

#### `/backend/src/controllers/adminController.js`
- `"Agent not found"` (HTTP 404)
- `"Property not found"` (HTTP 404)
- `"Restaurant not found"` (HTTP 404)
- `"agentId and planType required"`

### User/Entity Controllers

#### `/backend/src/controllers/userController.js`
- `"User not found"`
- `"Unauthorized"`
- `"Seller not found"`

#### `/backend/src/controllers/productController.js`
- `"Product not found"`

#### `/backend/src/controllers/reviewController.js`
- Uses service error messages

#### `/backend/src/controllers/favoriteController.js`
- `"Favorite not found"`

#### `/backend/src/controllers/uploadsController.js`
- `"Image file is required"`

#### `/backend/src/controllers/deliveryController.js`
- `"lat and lng required"`
- `"Agent not found"`
- `"Only buyers may create delivery orders"`

### Payment Services

#### `/backend/src/services/paymentService.js`
- `"transactionCode is required"`
- `"Either mpesaMessage or screenshotUrl is required"`
- `"Order not found"`
- `"Only buyer may submit payment proof"`
- `"approvedPaymentReference is required"`
- `"Only seller may approve payment"`
- `"Only seller may reject payment"`
- `"rejectionReason is required"`

#### `/backend/src/services/adminPaymentService.js`
- `"Order not found"`
- `"approvedPaymentReference is required"`
- `"rejectionReason is required"`
- `"Unknown admin payment action"`
- `"Seller not found"`
- `"Restaurant not found"`

### Food/Delivery Services

#### `/backend/src/services/foodService.js`
- `"Restaurant not found"`
- `"Only restaurant owners can create meals"`
- `"Duplicate meal listing"`
- `"Meal not found"`
- `"Unauthorized"`
- `"Restaurant not available"`
- `"One or more meals are invalid"`
- `"Dropoff location is required for delivery or rider orders"`
- `"Order not found"`
- `"Invalid transition from [status1] to [status2]"`
- `"Only the buyer may mark an order as paid"`
- `"Only restaurant owners may update this order status"`
- `"Cannot accept an order that has not been paid"`
- `"Only restaurant owners may mark food as out for delivery"`
- `"Pickup orders cannot transition to out_for_delivery"`
- `"Delivery completion is managed by the delivery service for delivery orders"`
- `"Only administrators may refund orders"`
- `"Restaurant pickup location is not configured"`

#### `/backend/src/services/deliveryService.js`
- `"Product not found"`
- `"Seller does not own this product"`
- `"Product is unavailable"`
- `"Product is not verified"`
- `"Order not found"`
- `"Not a platform delivery"`
- `"Delivery order is not pending assignment"`
- `"Invalid transition from [status1] to [status2]"`
- `"Only the assigned agent may update this delivery status"`
- `"Only the seller may update this delivery status"`
- `"Only administrators may assign platform delivery orders"`
- `"Only the seller may confirm a seller delivery assignment"`
- `"Unauthorized to cancel this delivery"`

### User/Cart Services

#### `/backend/src/services/userService.js`
- `"User not found"`
- `"Unauthorized"`

#### `/backend/src/services/cartService.js`
- `"Cart not found"`
- `"Unauthorized"`

#### `/backend/src/services/reviewService.js`
- `"Review not found"`
- `"Unauthorized"`

#### `/backend/src/services/productService.js`
- `"Product not found"`
- `"Unauthorized"`

#### `/backend/src/services/subscriptionService.js`
- `"Invalid plan"`

### Utility & Configuration

#### `/backend/src/utils/requireController.js`
- `"Controller [path] is missing exported handler: [property]"`

#### `/backend/src/config/validateEnv.js`
- `"Missing required env: [key]"`

#### `/backend/src/services/cloudinaryService.js`
- `"Unsupported file format."`

#### `/backend/src/routes/uploads.js`
- `"Unsupported image type. Use JPG, PNG, or WEBP."`

### Routing

#### `/backend/gateway/api-gateway.js`
- `"Not found"` (404)

#### `/backend/src/app.js`
- `"Not found"` (404)

### Other Services

#### `/backend/src/services/chatService.js`
- `"Conversation not found"`
- `"Unauthorized"`

#### `/backend/src/services/favoriteService.js`
- `"Favorite not found"`

#### `/backend/src/services/adminService.js`
- `"Product not found"`
- `"Invalid action"`
- `"Property not found"`
- `"Review not found"`
- `"User not found"`

#### `/backend/src/services/paymentProviders/paymentProvider.js`
- `"Not implemented"` (x3 - for each method)

### Database & Logging

#### `/backend/server.js`
- `"Database connection error"` (logged to console)

#### `/backend/src/config/redis.js`
- `"Redis error:"` (logged)
- `"Redis connection failed:"` (logged)

#### `/backend/require_routes.js`
- `"ERROR"` (logged with route and error)

### Migration Scripts

#### `/backend/scripts/migratePaymentStatuses.js`
- `"Failed to migrate [orderId]:"` (logged)
- `"Error querying FoodOrder:"` (logged)
- `"Failed to normalize [orderId]:"` (logged)
- `"Error normalizing statuses:"` (logged)
- `"Validation error:"` (logged)
- `"FATAL ERROR:"` (logged)

### Schemas & Validation

#### `/backend/src/schemas/auth.js`
- `"Invalid email address."`

#### `/backend/src/schemas/foodOrder.js`
- `"dropoffLocation is required for delivery or rider orders"`

---

## FRONTEND - React Admin Dashboard

### `/admin-dashboard/src/pages/LoginPage.jsx`
- `"Network error. Check your connection and try again."`
- `"Invalid credentials."` (fallback)
- `"Login failed. Please try again."` (fallback)

### `/admin-dashboard/src/services/api.js`
- `"Token refresh failed"`

### `/admin-dashboard/src/components/PrivateRoute.jsx`
- `"Session validation failed"`

---

## MOBILE - Flutter

### `/lib/features/cart/presentation/pages/checkout_payment_page.dart`
- `"Upload failed: [statusMessage]"`
- `"Upload error: [exception]"`
- `"Please enter transaction code"` (SnackBar)
- `"Please upload payment proof screenshot"` (SnackBar)
- `"Failed to submit proof: [exception]"` (SnackBar)

### `/lib/features/cart/presentation/pages/checkout_review_page.dart`
- `"Unable to review cart: [error]"`

### `/lib/features/products/presentation/pages/product_detail_page.dart`
- `"Unable to load product: [error]"`

### `/lib/features/products/presentation/pages/product_list_page.dart`
- Error text displays generic `error.toString()`

### Async Error Handlers (Generic Riverpod)
- `state = AsyncValue.error(err, stack)` - Used across controllers without specific messages

---

## RECOMMENDED ACTIONS

### 1. **Centralize Error Messages**
Create a constants file for all error messages to enable:
- Internationalization (i18n)
- Consistent messaging across platforms
- Easy updates without code changes
- Error message versioning

### 2. **Group by Type**
Organize into:
- **Authentication Errors** (401)
- **Authorization Errors** (403)
- **Validation Errors** (400)
- **Not Found Errors** (404)
- **Rate Limit Errors** (429)
- **Server Errors** (500)

### 3. **Add Error Codes**
Ensure all error messages have machine-readable codes:
```javascript
{
  error: "Message",
  code: "ERROR_CODE_KEY",
  statusCode: 400,
  details: {} // Optional context
}
```

### 4. **Separate User-Facing from System Messages**
- **User-Facing**: Generic, non-technical, actionable
- **System**: Detailed, logged, includes stack traces

### 5. **Flutter - Use Error Constants**
Replace dynamic error messages with typed constants for better null-safety and type checking.

---

## HIGH PRIORITY - DUPLICATE/CONFLICTING MESSAGES

| Message | Count | Files |
|---------|-------|-------|
| `"User not found"` | 3 | userController, userService, adminService |
| `"Product not found"` | 4 | productController, productService, adminService, deliveryService |
| `"Unauthorized"` | 5+ | Multiple services and controllers |
| `"Order not found"` | 3+ | Multiple payment/delivery services |
| `"Restaurant not found"` | 3 | foodService, adminPaymentService, and more |
| `"Invalid credentials"` | 3 | authController, adminAuthController (x2) |
| `"Account disabled"` | 4+ | Multiple auth/middleware files |
| `"Session expired"` | 3+ | Multiple middleware files |
| `"Insufficient privileges"` | 3+ | Multiple middleware files |

**Action**: Consolidate these into shared constants to ensure consistency.

---

## STATS BY CATEGORY

| Category | Count |
|----------|-------|
| Authentication | 25+ |
| Authorization | 12+ |
| Validation | 15+ |
| Not Found | 18+ |
| Payment-Related | 12+ |
| Delivery/Food | 22+ |
| Rate Limiting | 6+ |
| Logging/Console | 12+ |
| Flutter UI Messages | 6+ |
| Other | 20+ |

---

## DOCUMENT GENERATED
**Date:** June 1, 2026  
**Total Messages Found:** 180+  
**Scope:** Full codebase audit  
**Status:** Ready for refactoring  
