# Bolt Marketplace - Complete Backend Architecture & Database Schema Analysis

**Generated:** June 2, 2026  
**Scope:** Full backend database models, schemas, routes, middleware, and security analysis

---

## EXECUTIVE SUMMARY

The Bolt Marketplace backend implements a multi-sided marketplace platform with support for:
- **E-commerce**: Product marketplace (Buyers & Sellers)
- **Food Delivery**: Restaurant orders with delivery agents
- **Real Estate**: Property listings with monetization (boosting/featuring)
- **Unified Payment System**: Manual M-Pesa payment verification across all modules

**Key Architecture Characteristics:**
- **ORM:** Mongoose (MongoDB)
- **Framework:** Express.js
- **Authentication:** JWT with refresh tokens & token versioning
- **Authorization:** Role-based (buyer, seller, admin, super_admin, delivery_agent)
- **Payment Model:** Manual proof submission with seller/admin approval workflow

---

## DATABASE SCHEMA BREAKDOWN

### 1. USER MODEL

**File:** `backend/src/models/user.js`

**Purpose:** Central identity store for all user types

**Core Fields:**
```javascript
{
  name: String,                          // User name
  email: String (unique),                // Email (unique, lowercase)
  phone: String,                         // Phone number
  password: String,                      // Hashed password
  role: String,                          // buyer|seller|admin|super_admin (default: buyer)
  profileImage: String,                  // Profile picture URL
  
  // Authentication & Security
  emailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  failedLoginAttempts: Number (default: 0),
  lockedUntil: Date,
  
  // Session Management
  accountStatus: String,                 // active|disabled (default: active)
  suspended: Boolean (default: false),
  tokenVersion: Number (default: 0),     // For token invalidation on logout
  
  // Multi-Factor Authentication
  mfaEnabled: Boolean (default: false),
  mfaSecret: String,
  mfaTempSecret: String,
  
  // Admin Permissions
  permissions: [String] (default: []),
  
  // Delivery Agent Specific
  rating: Number (default: 5.0),
  totalDeliveries: Number (default: 0),
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  status: String,                        // available|busy|offline (default: offline)
  isVerified: Boolean (default: false),  // Agent verification status
  
  // Payment Methods (for agents/sellers)
  paymentMethods: {
    mpesaPhone: String,
    mpesaTill: String,
    mpesaPaybill: String,
    bankName: String,
    bankAccountNumber: String,
    accountName: String,
    airtelMoneyNumber: String
  },
  
  createdAt: Date (default: now)
}
```

**Key Methods:**
- `hasRole(roles)` - Check if user has any of the specified roles

**Indexes:**
- None explicitly defined (relies on unique email)

**Security Notes:**
- Password should never be selected in queries (explicitly excluded)
- `suspended` status checked on every authentication
- `accountStatus` must be 'active' for login
- `tokenVersion` enables token invalidation without database changes

---

### 2. PRODUCT MODEL

**File:** `backend/src/models/product.js`

**Purpose:** Marketplace products sold by sellers

**Fields:**
```javascript
{
  sellerId: ObjectId (ref: User),        // Seller who owns product
  name: String,                          // Product name (required)
  description: String,                   // Product description
  price: Number (min: 0),                // Product price (required)
  category: String,                      // Product category (required)
  images: [String],                      // Array of image URLs
  verified: Boolean (default: false),    // Admin verification status
  suspended: Boolean (default: false),   // Suspension flag
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on every save

**Key Characteristics:**
- **Seller Data Isolation:** Only owner or admin can modify
- **Verification:** Admin must approve before public visibility
- **Suspension:** Sellers can be suspended via admin action

---

### 3. PROPERTY MODEL

**File:** `backend/src/models/property.js`

**Purpose:** Real estate property listings with monetization features

**Fields:**
```javascript
{
  title: String,                         // Property title (required)
  description: String,                   // Detailed description
  price: Number (required),              // Property price
  
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  
  agentId: ObjectId (ref: User),         // Listing agent (required)
  
  // Monetization Features
  listingType: String,                   // free|featured|premium (default: free)
  isFeatured: Boolean (default: false),  // Currently featured flag
  featuredUntil: Date,                   // Feature expiration date
  
  // Boost System
  boostLevel: Number (0-3, default: 0),
  boostStartDate: Date,
  boostEndDate: Date,
  boostStatus: String,                   // none|pending|approved|rejected (default: none)
  
  // Verification & Tracking
  mockPaymentStatus: String,             // pending|paid|failed (for boost payment)
  isVerified: Boolean (default: false),  // Admin verification
  viewsCount: Number (default: 0),       // Property view counter
  inquiriesCount: Number (default: 0),   // Inquiry counter
  
  suspended: Boolean (default: false),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes:**
- Geospatial: `location.lat` and `location.lng` for location queries

**Pre-save Hook:**
- Updates `updatedAt` on save

**Key Characteristics:**
- **Featured Listings:** Time-limited visibility boost
- **Boost System:** Multi-tier boost with payment verification
- **Monetization:** Free tier or paid featured/premium listings
- **Geospatial Queries:** Enables location-based searches

---

### 4. RESTAURANT MODEL

**File:** `backend/src/models/restaurant.js`

**Purpose:** Restaurant entities for food delivery platform

**Fields:**
```javascript
{
  name: String (required),               // Restaurant name
  description: String,                   // Restaurant description
  
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  
  image: String,                         // Restaurant logo/image
  rating: Number (default: 0),           // Aggregate rating
  
  ownerId: ObjectId (ref: User),         // Restaurant owner (required)
  
  // Operations
  openHours: String,                     // Operating hours description
  
  // Status
  isVerified: Boolean (default: false),  // Admin verification
  suspended: Boolean (default: false),
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 5. MEAL MODEL

**File:** `backend/src/models/meal.js`

**Purpose:** Menu items within a restaurant

**Fields:**
```javascript
{
  name: String (required),               // Meal name
  price: Number (min: 0, required),      // Meal price
  description: String,                   // Meal description
  image: String,                         // Meal image URL
  
  category: String (required),           // breakfast|lunch|supper|dinner|snacks|drinks
  restaurantId: ObjectId (ref: Restaurant, required),
  restaurantName: String,                // Denormalized restaurant name
  
  isAvailable: Boolean (default: true),
  rating: Number (default: 0),
  orderCount: Number (default: 0),
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes:**
- Composite unique: `restaurantId` + `name`

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 6. FOOD ORDER MODEL

**File:** `backend/src/models/foodOrder.js`

**Purpose:** Customer food orders with embedded payment workflow

**Fields:**
```javascript
{
  buyerId: ObjectId (ref: User, required),
  restaurantId: ObjectId (ref: Restaurant, required),
  
  // Order Items
  mealItems: [{
    mealId: ObjectId (ref: Meal, required),
    quantity: Number (min: 1, required),
    price: Number (min: 0, required)
  }],
  
  totalAmount: Number (min: 0, required),
  
  // Delivery Details
  deliveryMode: String,                  // pickup|delivery|rider (default: pickup)
  deliveryAddress: String,
  dropoffLocation: {
    lat: Number,
    lng: Number
  },
  
  deliveryAgentId: ObjectId (ref: User),
  deliveryOrderId: ObjectId (ref: DeliveryOrder),
  
  // Order Status Progression
  status: String,                        // created|payment_pending|paid|accepted|preparing
                                         // |ready_for_pickup|out_for_delivery|completed|cancelled|refunded
  
  // Payment Sub-document
  payment: {
    method: String,
    amount: Number,
    transactionCode: String,             // M-Pesa transaction code
    mpesaMessage: String,                // M-Pesa confirmation message
    screenshotUrl: String,               // Payment proof screenshot
    submittedAt: Date,
    approvedAt: Date,
    approvedBy: ObjectId (ref: User),
    approvedPaymentReference: String,    // Reference from seller
    rejectionReason: String
  },
  
  // Unified Payment Status
  paymentStatus: String,                 // PENDING|AWAITING_SELLER_CONFIRMATION|PAID
                                         // |PAYMENT_REJECTED|PROCESSING|COMPLETED|CANCELLED
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 7. DELIVERY ORDER MODEL

**File:** `backend/src/models/deliveryOrder.js`

**Purpose:** Delivery assignments and tracking (for both food and product delivery)

**Fields:**
```javascript
{
  buyerId: ObjectId (ref: User, required),
  sellerId: ObjectId (ref: User, required),
  deliveryAgentId: ObjectId (ref: User),
  
  productId: String,                     // Generic product identifier
  foodOrderId: ObjectId (ref: FoodOrder),
  
  // Location Data
  pickupLocation: {
    lat: Number (required),
    lng: Number (required)
  },
  dropoffLocation: {
    lat: Number (required),
    lng: Number (required)
  },
  
  fee: Number (default: 0),
  
  // Delivery Type
  deliveryMode: String,                  // seller_delivery|platform_delivery (default: seller_delivery)
  
  // Delivery Status
  status: String,                        // pending_assignment|assigned|picked_up
                                         // |in_transit|delivered|failed|cancelled
  
  // Manual Payment Verification (same as FoodOrder)
  payment: {
    method: String,
    amount: Number,
    transactionCode: String,
    mpesaMessage: String,
    screenshotUrl: String,
    submittedAt: Date,
    approvedAt: Date,
    approvedBy: ObjectId (ref: User),
    approvedPaymentReference: String,
    rejectionReason: String
  },
  
  paymentStatus: String,                 // PENDING|AWAITING_SELLER_CONFIRMATION|PAID|...
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 8. PAYMENT MODEL

**File:** `backend/src/models/payment.js`

**Purpose:** Unified payment entity for future scalability (currently in migration phase)

**Fields:**
```javascript
{
  // Payment Identification
  paymentType: String,                   // FOOD_ORDER|DELIVERY_ORDER|PROPERTY_LISTING|SELLER_SUBSCRIPTION
  referenceId: ObjectId (required, indexed),
  
  // Parties Involved
  payer: {
    userId: ObjectId (ref: User, required),
    name: String,
    email: String
  },
  receiver: {
    userId: ObjectId (ref: User),
    restaurantId: ObjectId (ref: Restaurant),
    name: String,
    email: String
  },
  
  // Amount & Currency
  amount: Number (min: 0, required),
  currency: String (default: KES),
  
  // Payment Details
  method: String,
  transactionCode: String (unique, sparse),
  reference: String,
  
  // Proof & Documentation
  proofUrl: String,
  mpesaMessage: String,
  
  // Unified Status
  status: String,                        // PENDING|AWAITING_SELLER_CONFIRMATION|PAID
                                         // |PAYMENT_REJECTED|REFUNDED|PROCESSING|...
  
  // Approval Chain
  approvedAt: Date,
  approvedBy: ObjectId (ref: User),
  approvedReference: String,
  
  // Rejection Tracking
  rejectedAt: Date,
  rejectionReason: String,
  
  // Refund Information
  refundedAt: Date,
  refundReason: String,
  refundAmount: Number,
  
  // Audit & Metadata
  createdAt: Date (default: now, indexed),
  updatedAt: Date (default: now),
  submittedAt: Date,
  metadata: Map (Mixed)
}
```

**Indexes:**
- `paymentType` + `status`
- `payer` + `createdAt`
- `receiver` + `createdAt`
- `status` + `createdAt`
- `approvedBy` + `approvedAt`
- TTL index on `createdAt`

**Status Flow:**
```
PENDING → AWAITING_SELLER_CONFIRMATION → PAID → COMPLETED
                ↓
          PAYMENT_REJECTED → (resubmit) → AWAITING_SELLER_CONFIRMATION
                ↓
             REFUNDED (end state)
```

---

### 9. CART MODEL

**File:** `backend/src/models/cart.js`

**Purpose:** Shopping cart for product purchases

**Fields:**
```javascript
{
  userId: ObjectId (ref: User, required),
  
  items: [{
    productId: ObjectId (ref: Product, required),
    quantity: Number (min: 1, required),
    price: Number (min: 0, required)
  }],
  
  total: Number (min: 0, required),
  paymentStatus: String,                 // PENDING|PAID|REFUNDED|... (default: PENDING)
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 10. REVIEW MODEL

**File:** `backend/src/models/review.js`

**Purpose:** Product reviews from customers

**Fields:**
```javascript
{
  productId: ObjectId (ref: Product, required),
  userId: ObjectId (ref: User, required),
  rating: Number (1-5, required),
  comment: String,
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 11. FAVORITE MODEL

**File:** `backend/src/models/favorite.js`

**Purpose:** User product favorites/wishlist

**Fields:**
```javascript
{
  userId: ObjectId (ref: User, required),
  productId: ObjectId (ref: Product, required),
  createdAt: Date (default: now)
}
```

**Indexes:**
- Composite unique: `userId` + `productId` (prevents duplicates)

---

### 12. CONVERSATION MODEL

**File:** `backend/src/models/conversation.js`

**Purpose:** Direct messaging between users

**Fields:**
```javascript
{
  participants: [ObjectId (ref: User, required)],
  
  messages: [{
    senderId: ObjectId (ref: User, required),
    recipientId: ObjectId (ref: User, required),
    content: String (required),
    createdAt: Date (default: now)
  }],
  
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Pre-save Hook:**
- Updates `updatedAt` on save

---

### 13. NOTIFICATION MODEL

**File:** `backend/src/models/notification.js`

**Purpose:** User notifications

**Fields:**
```javascript
{
  userId: ObjectId (ref: User, required),
  title: String (required),
  body: String,
  data: Object,
  read: Boolean (default: false),
  createdAt: Date (default: now)
}
```

---

### 14. AGENT SUBSCRIPTION MODEL

**File:** `backend/src/models/agentSubscription.js`

**Purpose:** Property agent subscription tiers

**Fields:**
```javascript
{
  agentId: ObjectId (ref: User, required, unique),
  planType: String,                      // free|pro|agency (default: free)
  maxListings: Number (default: 3),      // Max active listings for plan
  activeListingsCount: Number (default: 0),
  expiresAt: Date,
  status: String,                        // active|expired|suspended (default: active)
  createdAt: Date (default: now)
}
```

---

### 15. ADMIN SESSION MODEL

**File:** `backend/src/models/adminSession.js`

**Purpose:** Track admin login sessions (security & device management)

**Fields:**
```javascript
{
  adminId: ObjectId (ref: User, required),
  jti: String (required, indexed),       // JWT ID for token tracking
  refreshTokenHash: String (required),   // Hashed refresh token
  ipAddress: String,
  userAgent: String,
  deviceName: String,
  
  createdAt: Date (default: now),
  lastSeenAt: Date (default: now),
  expiresAt: Date,
  isRevoked: Boolean (default: false),
  
  // Indexes for efficient queries and TTL cleanup
  // TTL: auto-delete after expiration
}
```

**Indexes:**
- `adminId` + `isRevoked`
- TTL index on `expiresAt` for automatic cleanup

---

### 16. AUDIT LOG MODEL

**File:** `backend/src/models/auditLog.js`

**Purpose:** Track all admin actions for compliance

**Fields:**
```javascript
{
  adminId: ObjectId (ref: User, required),
  action: String (required),             // approve_boost, verify_property, suspend_seller, etc.
  resource: String (required),           // product, property, user, restaurant, etc.
  resourceId: String,
  ipAddress: String,
  userAgent: String,
  requestId: String,
  status: Number,                        // HTTP status code
  durationMs: Number,
  timestamp: Date (default: now)
}
```

---

### 17. PAYMENT AUDIT MODEL

**File:** `backend/src/models/paymentAudit.js`

**Purpose:** Track payment verification history

**Fields:**
```javascript
{
  action: String (required),             // payment_submitted, payment_approved, payment_rejected, admin_override
  actor: ObjectId (ref: User),           // Who performed the action
  actorRole: String,                     // Role of the actor
  orderId: String,                       // Order ID (string for flexibility)
  reason: String,
  metadata: Object,
  timestamp: Date (default: now)
}
```

---

## USER TYPE DIFFERENTIATION IN DATABASE

### Role-Based Architecture

```
BUYER
├── Can create products (becomes seller)
├── Can purchase products
├── Can place food orders
├── Can view properties
├── Can submit payment proofs
└── Cannot approve payments

SELLER
├── Can create products
├── Can manage own products (edit, delete, suspend)
├── Can approve payment proofs from buyers
├── Can manage property listings
└── Cannot access admin functions

DELIVERY_AGENT
├── Has location tracking
├── Has availability status (available|busy|offline)
├── Can be assigned to deliveries
├── Rating and delivery count tracking
└── Can be verified by admin

ADMIN
├── Can moderate all products
├── Can moderate properties
├── Can approve/reject boosts
├── Can verify/suspend restaurants
├── Can manage users (suspend, activate)
├── Can override payment approvals
├── Can view analytics
└── Has role-based permission model

SUPER_ADMIN
├── All admin privileges
├── Can manage admin accounts
├── Can manage platform settings
└── Has full system access
```

### Data Isolation by Role

| Operation | Buyer | Seller | Delivery Agent | Admin | Super Admin |
|-----------|-------|--------|-----------------|-------|-------------|
| Create Product | ✓ | ✓ | ✗ | ✓ | ✓ |
| Edit Own Product | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit Any Product | ✗ | ✗ | ✗ | ✓ | ✓ |
| Approve Payment | ✗ | ✓ (own) | ✗ | ✓ | ✓ |
| Create Property | ✓ | ✓ | ✗ | ✗ | ✓ |
| Moderate Content | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✗ | ✓ | ✓ |
| Override Payment | ✗ | ✗ | ✗ | ✓ | ✓ |

---

## SELLER APPROVAL & VERIFICATION PROCESS

### Current System (Manual-Based)

**Seller Account Creation:**
1. User registers with role='seller'
2. Automatically granted seller permissions
3. Can immediately create products (unverified)

**Product Verification:**
```
Product Created → Admin Review → Approved/Rejected
                                      ↓
                                  Listed/Hidden
```

**Restaurant Verification:**
```
Restaurant Created (unverified) → Admin Verification
                                        ↓
                                    isVerified = true
```

**Property Listing Verification:**
```
Property Created → Admin Verification (isVerified flag)
                   OR
                   Boost Request → Admin Approval → Featured
```

### Authorization Checks

**Product Update/Delete:**
```javascript
if (product.sellerId.toString() !== user.id && user.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

**Payment Approval (Seller):**
```javascript
if (String(order.sellerId) !== String(user.id) && 
    String(order.restaurantId) !== String(user.id)) {
  throw new Error('Only seller may approve payment');
}
```

### Seller Suspension

```javascript
// Admin can suspend seller via manageUser action
if (req.params.action === 'suspend') {
  user.suspended = true;
  await user.save();
}

// On authentication, suspended check prevents login
if (user.suspended || user.accountStatus !== 'active') {
  throw new Error('Account disabled');
}
```

---

## PAYMENT FLOW ARCHITECTURE

### Current Payment System: Manual M-Pesa Verification

**Overall Flow:**
```
1. PENDING (Order Created)
        ↓
2. AWAITING_PAYMENT (Buyer sends M-Pesa)
        ↓
3. Buyer Submits Payment Proof
   - Transaction code
   - M-Pesa message OR screenshot URL
        ↓
4. AWAITING_SELLER_CONFIRMATION (Seller reviews proof)
        ↓
5. Seller Decision
   ├── APPROVE → PAID → Processing
   └── REJECT → PAYMENT_REJECTED → (Buyer can resubmit)
        ↓
6. COMPLETED or REFUNDED
```

### Endpoint Security - Payment Workflow

**1. Submit Payment Proof**
```javascript
POST /api/orders/:id/payment-proof
Authorization: Bearer {token}

Only buyer of order can submit:
if (String(order.buyerId) !== String(user.id)) {
  throw 'Only buyer may submit payment proof';
}
```

**2. Seller Approval**
```javascript
POST /api/orders/:id/approve-payment
Authorization: Bearer {token}

Only seller can approve:
if (String(order.sellerId) !== String(user.id) && 
    String(order.restaurantId) !== String(user.id)) {
  throw 'Only seller may approve payment';
}
```

**3. Admin Override**
```javascript
POST /api/admin/payments/:id/override
Authorization: Bearer {admin_token}

Only admin with override permission:
- Requires authenticateAdmin middleware
- Checks authorizeAdmin(['permissions'])
- Logs action in PaymentAudit
```

### Payment Status Constants (UNIFIED)

```javascript
const PAYMENT_STATUS = {
  PENDING: 'PENDING',                    // Initial state
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',  // Order placed, waiting for M-Pesa
  AWAITING_SELLER_CONFIRMATION: 'AWAITING_SELLER_CONFIRMATION',
  PAID: 'PAID',                          // Approved by seller
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',  // Seller rejected proof
  REFUNDED: 'REFUNDED',                  // Money returned to buyer
  PROCESSING: 'PROCESSING',             // Payment confirmed, order processing
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};
```

---

## API ENDPOINT SECURITY MODEL

### Authentication Middleware Stack

**1. General Endpoints (Buyer/Seller)**
```
Route Middleware Chain:
  ↓
sanitizeMiddleware (input sanitization)
  ↓
rateLimiter (100 req/min, Redis-backed)
  ↓
authenticate (JWT verification + token revocation check + account status)
  ↓
validateObjectId (if ID in params)
  ↓
validateRequest (Zod schema validation)
  ↓
Controller
```

**2. Admin Endpoints**
```
Route Middleware Chain:
  ↓
authenticateAdmin (JWT with token.type === 'admin')
  ↓
authorizeAdmin (role check + permission-based access control)
  ↓
Controller
  ↓
AuditLog (action tracked)
```

### Key Authorization Patterns

**Pattern 1: Ownership Verification**
```javascript
// Product ownership check
if (product.sellerId.toString() !== user.id && user.role !== 'admin') {
  throw 'Unauthorized';
}
```

**Pattern 2: Role-Based Access**
```javascript
// Admin-only endpoints
authorize(['admin', 'super_admin'])(req, res, next)
```

**Pattern 3: Entity-Specific Authorization**
```javascript
// Seller can only approve own orders
if (String(order.sellerId) !== String(user.id) && 
    String(order.restaurantId) !== String(user.id)) {
  throw 'Only seller may approve';
}
```

### Rate Limiting by Role

| Limiter | Window | Max Requests | Purpose |
|---------|--------|--------------|---------|
| `authLimiter` | 15 min | 5 | Login/register attacks |
| `generalLimiter` | 1 min | 100 | General API rate limit |
| `sellerLimiter` | 1 min | 200 | Seller-heavy operations |
| `adminLimiter` | 1 min | 500 | Admin operations |
| `adminAuthLimiter` | 1 hour | 10 | Admin login brute force |

### Input Validation & Sanitization

**Sanitization Middleware:**
```javascript
// Blocks keys with $ or . (MongoDB injection prevention)
// Removes HTML tags from all strings
// Trims whitespace
sanitizeInput({
  $ne: 'blocked',        // ✗ BLOCKED
  'key.nested': 'blocked' // ✗ BLOCKED (dot notation)
})
```

**Schema Validation (Zod):**
```javascript
registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7).max(20),
  role: z.enum(['buyer', 'seller']).default('buyer')
})
```

---

## DATABASE VULNERABILITIES & SECURITY ISSUES

### CRITICAL ISSUES

#### 1. **Missing Seller Verification/KYC Process**
**Severity:** CRITICAL  
**Issue:** Any user can register as seller and immediately create products without verification
**Code Location:** `backend/src/controllers/authController.js` - `register()`
```javascript
// No seller verification step
const user = await User.create({
  role,  // Can be 'seller' immediately
  emailVerified: false  // Only email needs verification, not seller status
});
```
**Impact:** Fraudulent sellers can list products without vetting

**Recommendation:**
- Implement seller approval workflow (pending → approved/rejected)
- Add KYC/business verification requirements
- Store `sellerStatus` field (pending|approved|rejected)
- Admin approval before seller can list products

---

#### 2. **Payment Proof Verification Lacks Authenticity Checks**
**Severity:** CRITICAL  
**Issue:** Screenshots can be fake; no M-Pesa API integration for verification
**Code Location:** `backend/src/services/paymentService.js`
```javascript
// Only stores submitted proof, doesn't verify authenticity
order.payment.screenshotUrl = screenshotUrl;  // Could be doctored
order.payment.transactionCode = transactionCode;  // No validation
order.paymentStatus = 'AWAITING_SELLER_CONFIRMATION';
```
**Impact:** Fraud risk - sellers can approve fake payments; buyers can dispute

**Recommendation:**
- Integrate with M-Pesa API for real-time verification
- Validate transaction codes against M-Pesa B2C receipts
- Implement payment webhook verification
- Flag suspicious transaction patterns

---

#### 3. **Admin Override Has No Permission Checks**
**Severity:** CRITICAL  
**Issue:** Admin can override any payment without granular permission verification
**Code Location:** `backend/src/controllers/adminPaymentsController.js`
```javascript
const overridePayment = async (req, res) => {
  // No specific permission check for override action
  const order = await adminPaymentService.updateOrderStatus({
    orderId: req.params.id,
    user: req.user,  // Just needs admin role
    action,
    payload
  });
}
```
**Impact:** Rogue admins can approve fraudulent payments

**Recommendation:**
- Require `payments.override` permission specifically
- Implement double-approval for overrides exceeding threshold
- Add mandatory override reason with max fraud detection
- Higher audit logging for overrides

---

#### 4. **Cross-Seller Data Access Not Fully Restricted**
**Severity:** HIGH  
**Issue:** Query parameters allow filtering by other sellers' data
**Code Location:** `backend/src/controllers/productController.js`
```javascript
const listProducts = async (req, res) => {
  const products = await productService.listProducts({
    sellerId: req.query.sellerId  // User can query any seller
  });
}
```
**Impact:** Competitors can extract business intelligence (product catalog, pricing, quantities)

**Recommendation:**
- Remove direct `sellerId` filter from buyer requests
- Only allow sellers to query own products
- Implement vendor-specific views
- Restrict analytics to product owner

---

#### 5. **Admin Permissions Not Actually Used in Authorization**
**Severity:** HIGH  
**Issue:** `permissions` array exists but barely checked; mostly role-based only
**Code Location:** `backend/src/middleware/authorizeAdmin.js`
```javascript
if (allowedPermissions.length > 0) {
  // Only checked if route explicitly requires it
  // Most routes use simple role check: ['admin', 'super_admin']
  const hasPermission = allowedPermissions.every(
    permission => tokenPermissions.includes(permission)
  );
}
```
**Impact:** Fine-grained admin access control not enforced

**Recommendation:**
- Use permission-based authorization for all admin routes
- Implement permission enum (products.approve, payments.override, users.suspend, etc.)
- Remove simple role-based authorization for sensitive operations
- Add permission validation decorator to admin routes

---

### HIGH SEVERITY ISSUES

#### 6. **No Seller Suspension Propagation**
**Severity:** HIGH  
**Issue:** When seller suspended, their active orders continue without interruption
**Code Location:** `backend/src/controllers/adminPaymentsController.js`
```javascript
const suspendSeller = async (req, res) => {
  // Only suspends user, doesn't handle active orders
  target.suspended = true;
  await target.save();
}
```
**Impact:** Suspended sellers can still complete transactions

**Recommendation:**
- Cascade suspend to all active orders/listings
- Notify buyers of seller suspension
- Offer order cancellation with refund
- Block seller from creating new listings immediately

---

#### 7. **Payment Auditing Lacks Traceability**
**Severity:** HIGH  
**Issue:** PaymentAudit logs don't capture all relevant context
**Code Location:** `backend/src/models/paymentAudit.js`
```javascript
const paymentAuditSchema = new mongoose.Schema({
  action: String,
  actor: ObjectId,
  orderId: String,  // Storing only string ID, not full context
  metadata: Object
});
```
**Impact:** Difficult to trace fraud or admin abuse

**Recommendation:**
- Store full order snapshot in audit log
- Include payment amounts, seller/buyer IDs
- Capture before/after payment states
- Add geoIP tracking of approval location

---

#### 8. **Email Verification Not Enforced**
**Severity:** HIGH  
**Issue:** Users can perform critical actions (create products, order) with unverified emails
**Code Location:** `backend/src/models/user.js`
```javascript
emailVerified: { type: Boolean, default: false }  // No enforcement
```
**Impact:** Spam/phishing risk; account takeover via recovery email

**Recommendation:**
- Block product creation until email verified
- Block seller features until verified
- Require email verification for payment operations
- Auto-lock account if email verification fails 3x

---

#### 9. **Account Lockout Bypassed on Token Reuse**
**Severity:** HIGH  
**Issue:** `failedLoginAttempts` can be reset if attacker has valid token
**Code Location:** `backend/src/models/user.js`
```javascript
failedLoginAttempts: { type: Number, default: 0 },
lockedUntil: { type: Date }  // Not always checked
```
**Impact:** Brute force attacks if old tokens aren't revoked properly

**Recommendation:**
- Increment attempts on account across all sessions
- Lock account completely after threshold
- Require admin unlock or time-based unlock
- Implement CAPTCHA after N failed attempts

---

#### 10. **Product Category Not Validated Against Whitelist**
**Severity:** MEDIUM  
**Issue:** Any category string accepted; enables category manipulation
**Code Location:** `backend/src/schemas/product.js`
```javascript
category: z.string().min(1)  // No enum validation
```
**Impact:** Misclassified products; broken search/filtering

**Recommendation:**
- Validate against predefined category enum
- Store category as separate index table
- Implement category moderation

---

### MEDIUM SEVERITY ISSUES

#### 11. **No Rate Limiting on Payment Operations**
**Severity:** MEDIUM  
**Issue:** Payment approval endpoints not rate limited
**Code Location:** `backend/src/routes/admin.js`
```javascript
router.post('/payments/:id/approve', 
  validateObjectId('id'),  // No rate limit
  adminPaymentsController.approvePayment
);
```
**Impact:** Admin can be spammed with requests

**Recommendation:**
- Apply `adminLimiter` to all admin routes
- Implement per-user payment processing limits

---

#### 12. **Refresh Token Not Rotation-Protected**
**Severity:** MEDIUM  
**Issue:** Refresh token reuse doesn't invalidate on refresh
**Code Location:** `backend/src/services/authService.js`
```javascript
// Refresh tokens potentially reused; no rotation
const refreshToken = jwt.sign(payload, secret);
```
**Impact:** Stolen refresh tokens can be used indefinitely

**Recommendation:**
- Implement refresh token rotation
- Invalidate old token on new token generation
- Store refresh token hash in DB (like AdminSession does)

---

#### 13. **No Soft Deletes for Orders/Listings**
**Severity:** MEDIUM  
**Issue:** Hard deletes of orders lose audit trail
**Code Location:** `backend/src/services/productService.js`
```javascript
await Product.deleteOne({ _id: id });  // Hard delete - data lost
```
**Impact:** Compliance issue; cannot audit historical data

**Recommendation:**
- Use soft delete pattern (add `deletedAt` field)
- Filter soft-deleted records in queries
- Maintain historical audit trail

---

#### 14. **Conversation/Message Not Encrypted**
**Severity:** MEDIUM  
**Issue:** Messages stored in plaintext
**Code Location:** `backend/src/models/conversation.js`
```javascript
content: { type: String, required: true }  // Plaintext
```
**Impact:** Privacy risk; sensitive communications exposed

**Recommendation:**
- Encrypt message content at rest
- Use TLS for transport
- Implement end-to-end encryption

---

#### 15. **Location Data Has No Accuracy Verification**
**Severity:** MEDIUM  
**Issue:** Delivery agents can spoof GPS coordinates
**Code Location:** `backend/src/models/user.js`
```javascript
currentLocation: {
  lat: Number,
  lng: Number,
  updatedAt: Date
}  // No validation
```
**Impact:** Fraudulent delivery claims

**Recommendation:**
- Validate location changes are within feasible speed
- Require geofencing verification
- Implement GPS anomaly detection

---

### LOW SEVERITY ISSUES

#### 16. **No API Versioning**
**Severity:** LOW  
**Issue:** Breaking changes will break all clients
**Impact:** Upgrade coordination problems

---

#### 17. **User.isVerified Vs emailVerified Confusion**
**Severity:** LOW  
**Issue:** Two verification flags serve different purposes but similar names
```javascript
emailVerified: Boolean,        // Email ownership verified
isVerified: Boolean            // Delivery agent/KYC verified
```
**Recommendation:** Rename to `emailVerified` and `kycVerified`

---

## SECURITY BEST PRACTICES IMPLEMENTED

### Strengths

✅ **JWT with Revocation:** Access tokens tracked with JTI  
✅ **Token Versioning:** Logout invalidates all tokens  
✅ **HttpOnly Cookies:** Refresh tokens not accessible to JavaScript  
✅ **Password Hashing:** Using Argon2  
✅ **Input Sanitization:** MongoDB injection prevention  
✅ **Ownership Verification:** Seller can only edit own products  
✅ **Admin Session Tracking:** Device/IP logging for admin access  
✅ **Audit Logging:** Admin actions logged  
✅ **Rate Limiting:** Per-role rate limits  
✅ **CORS Protection:** Configured CORS middleware  
✅ **Helmet.js:** HTTP security headers  
✅ **Payment Audit Trail:** Payment actions logged separately  

---

## RECOMMENDATIONS SUMMARY

### Immediate Actions (CRITICAL)
1. Implement seller verification/approval workflow
2. Integrate real M-Pesa API for payment verification
3. Add granular admin permissions enforcement
4. Implement seller suspension cascade

### Short-term (HIGH)
5. Enforce email verification before sensitive operations
6. Implement refresh token rotation
7. Use soft deletes for audit compliance
8. Add permission-based authorization to all admin routes

### Medium-term (MEDIUM)
9. Encrypt sensitive data at rest
10. Add geolocation anomaly detection
11. Implement stronger account lockout
12. Add category whitelist validation

### Long-term (LOW)
13. Implement API versioning
14. Clarify verification flag semantics
15. Add end-to-end encryption for messages
16. Implement rate limiting on payment operations

---

## PAYMENT STATUS ENUM (AUTHORITATIVE)

```javascript
PENDING                          → Order created, awaiting payment
AWAITING_PAYMENT                 → Buyer should pay
AWAITING_SELLER_CONFIRMATION     → Payment proof submitted by buyer
PAID                             → Seller/Admin approved
PAYMENT_REJECTED                 → Proof rejected by seller
REFUNDED                         → Money returned
PROCESSING                       → Payment confirmed, order processing
READY_FOR_DELIVERY               → Order ready
OUT_FOR_DELIVERY                 → In transit
DELIVERED                        → Reached destination
COMPLETED                        → Fully completed
CANCELLED                        → Order cancelled
```

---

## ROUTES SUMMARY

### Public Routes (No Auth)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
```

### Buyer Routes (Authenticated)
```
GET    /api/products
GET    /api/products/:id
GET    /api/properties
GET    /api/properties/:id
POST   /api/orders/:id/payment-proof
POST   /api/favorites/:id
GET    /api/chat
```

### Seller Routes (Authenticated)
```
POST   /api/products (create)
PUT    /api/products/:id (edit own)
DELETE /api/products/:id (delete own)
POST   /api/properties (create)
GET    /api/orders/seller/pending
POST   /api/orders/:id/approve-payment
```

### Admin Routes (authenticateAdmin + authorizeAdmin)
```
GET    /api/admin/analytics
GET    /api/admin/payments
POST   /api/admin/payments/:id/approve
POST   /api/admin/payments/:id/override
PATCH  /api/admin/products/:action/:id
PATCH  /api/admin/properties/:action/:id
PATCH  /api/admin/users/:action/:id
GET    /api/admin/delivery-agents
```

