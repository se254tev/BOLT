/**
 * CENTRALIZED ERROR CODE CONTRACT
 * Single source of truth for all API errors across Bolt platform
 * All backend errors MUST use this enum
 */

const ERRORS = {
  // ============================================
  // AUTHENTICATION ERRORS (401, 403)
  // ============================================
  AUTHENTICATION_REQUIRED: {
    code: 'AUTHENTICATION_REQUIRED',
    httpStatus: 401,
    message: 'Authentication required',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    httpStatus: 401,
    message: 'Invalid access token',
  },
  TOKEN_REVOKED: {
    code: 'TOKEN_REVOKED',
    httpStatus: 401,
    message: 'Access token has been revoked',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    httpStatus: 401,
    message: 'Session expired. Please login again',
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    httpStatus: 401,
    message: 'Invalid or expired refresh token',
  },
  REFRESH_TOKEN_REQUIRED: {
    code: 'REFRESH_TOKEN_REQUIRED',
    httpStatus: 401,
    message: 'Refresh token required',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    httpStatus: 401,
    message: 'Invalid email or password',
  },
  INVALID_RESET_TOKEN: {
    code: 'INVALID_RESET_TOKEN',
    httpStatus: 400,
    message: 'Invalid or expired reset token',
  },
  INVALID_VERIFICATION_TOKEN: {
    code: 'INVALID_VERIFICATION_TOKEN',
    httpStatus: 400,
    message: 'Invalid or expired verification token',
  },
  INVALID_MFA_TOKEN: {
    code: 'INVALID_MFA_TOKEN',
    httpStatus: 401,
    message: 'Invalid MFA token',
  },
  MFA_REQUIRED: {
    code: 'MFA_REQUIRED',
    httpStatus: 428,
    message: 'MFA token required',
  },
  MFA_NOT_INITIATED: {
    code: 'MFA_NOT_INITIATED',
    httpStatus: 400,
    message: 'MFA not initiated for this account',
  },

  // ============================================
  // AUTHORIZATION ERRORS (403)
  // ============================================
  AUTHORIZATION_REQUIRED: {
    code: 'AUTHORIZATION_REQUIRED',
    httpStatus: 401,
    message: 'Authorization required',
  },
  INSUFFICIENT_PRIVILEGES: {
    code: 'INSUFFICIENT_PRIVILEGES',
    httpStatus: 403,
    message: 'Insufficient privileges for this action',
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    httpStatus: 403,
    message: 'Permission denied',
  },
  ADMIN_ACCESS_REQUIRED: {
    code: 'ADMIN_ACCESS_REQUIRED',
    httpStatus: 403,
    message: 'Admin access required',
  },
  ADMIN_AUTH_REQUIRED: {
    code: 'ADMIN_AUTH_REQUIRED',
    httpStatus: 403,
    message: 'Admin users must sign in through the admin auth endpoint',
  },
  ACCOUNT_DISABLED: {
    code: 'ACCOUNT_DISABLED',
    httpStatus: 403,
    message: 'Account has been disabled',
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    httpStatus: 403,
    message: 'Account locked due to multiple failed login attempts',
  },

  // ============================================
  // USER ERRORS (400, 404)
  // ============================================
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    httpStatus: 404,
    message: 'User not found',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to access this resource',
  },
  EMAIL_ALREADY_REGISTERED: {
    code: 'EMAIL_ALREADY_REGISTERED',
    httpStatus: 409,
    message: 'Email already registered',
  },
  SELLER_NOT_FOUND: {
    code: 'SELLER_NOT_FOUND',
    httpStatus: 404,
    message: 'Seller not found',
  },
  ADMIN_NOT_FOUND: {
    code: 'ADMIN_NOT_FOUND',
    httpStatus: 404,
    message: 'Admin not found',
  },
  INVALID_IDENTIFIER: {
    code: 'INVALID_IDENTIFIER',
    httpStatus: 400,
    message: 'Invalid identifier format',
  },

  // ============================================
  // PRODUCT ERRORS (400, 404)
  // ============================================
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    httpStatus: 404,
    message: 'Product not found',
  },
  PRODUCT_UNAVAILABLE: {
    code: 'PRODUCT_UNAVAILABLE',
    httpStatus: 400,
    message: 'Product is unavailable',
  },
  PRODUCT_NOT_VERIFIED: {
    code: 'PRODUCT_NOT_VERIFIED',
    httpStatus: 400,
    message: 'Product is not verified',
  },
  DUPLICATE_PRODUCT: {
    code: 'DUPLICATE_PRODUCT',
    httpStatus: 409,
    message: 'Product already exists',
  },

  // ============================================
  // ORDER ERRORS (400, 404)
  // ============================================
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    httpStatus: 404,
    message: 'Order not found',
  },
  INVALID_ORDER_STATUS_TRANSITION: {
    code: 'INVALID_ORDER_STATUS_TRANSITION',
    httpStatus: 400,
    message: 'Invalid order status transition',
  },
  ORDER_UNAUTHORIZED: {
    code: 'ORDER_UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to access this order',
  },
  SERVICE_REQUEST_NOT_FOUND: {
    code: 'SERVICE_REQUEST_NOT_FOUND',
    httpStatus: 404,
    message: 'Service request not found',
  },
  NOT_A_REGISTERED_WORKER: {
    code: 'NOT_A_REGISTERED_WORKER',
    httpStatus: 403,
    message: 'Worker profile required to perform this action',
  },
  BID_NOT_FOUND: {
    code: 'BID_NOT_FOUND',
    httpStatus: 404,
    message: 'Bid not found',
  },
  INVALID_REQUEST_STATE_TRANSITION: {
    code: 'INVALID_REQUEST_STATE_TRANSITION',
    httpStatus: 400,
    message: 'Invalid service request state transition',
  },
  INVALID_BID_ACTION: {
    code: 'INVALID_BID_ACTION',
    httpStatus: 400,
    message: 'Invalid bid action for this request',
  },
  REQUEST_FORBIDDEN: {
    code: 'REQUEST_FORBIDDEN',
    httpStatus: 403,
    message: 'Unauthorized to access this request',
  },
  DROPOFF_LOCATION_REQUIRED: {
    code: 'DROPOFF_LOCATION_REQUIRED',
    httpStatus: 400,
    message: 'Dropoff location is required for delivery or rider orders',
  },
  PAYMENT_REQUIRED_FOR_ORDER: {
    code: 'PAYMENT_REQUIRED_FOR_ORDER',
    httpStatus: 400,
    message: 'Cannot accept an order that has not been paid',
  },
  ONLY_BUYER_MAY_PAY: {
    code: 'ONLY_BUYER_MAY_PAY',
    httpStatus: 403,
    message: 'Only the buyer may submit payment proof',
  },
  ONLY_SELLER_MAY_UPDATE: {
    code: 'ONLY_SELLER_MAY_UPDATE',
    httpStatus: 403,
    message: 'Only the seller may update this order status',
  },
  ONLY_BUYERS_CREATE_ORDERS: {
    code: 'ONLY_BUYERS_CREATE_ORDERS',
    httpStatus: 403,
    message: 'Only buyers may create orders',
  },
  INVALID_MEAL: {
    code: 'INVALID_MEAL',
    httpStatus: 400,
    message: 'One or more meals are invalid or unavailable',
  },

  // ============================================
  // PAYMENT ERRORS (400, 402, 404)
  // ============================================
  PAYMENT_NOT_FOUND: {
    code: 'PAYMENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Payment record not found',
  },
  PAYMENT_PROOF_REQUIRED: {
    code: 'PAYMENT_PROOF_REQUIRED',
    httpStatus: 400,
    message: 'Payment proof is required',
  },
  TRANSACTION_CODE_REQUIRED: {
    code: 'TRANSACTION_CODE_REQUIRED',
    httpStatus: 400,
    message: 'Transaction code is required',
  },
  PAYMENT_PROOF_INVALID: {
    code: 'PAYMENT_PROOF_INVALID',
    httpStatus: 400,
    message: 'Either M-Pesa message or screenshot URL is required',
  },
  PAYMENT_APPROVAL_REFERENCE_REQUIRED: {
    code: 'PAYMENT_APPROVAL_REFERENCE_REQUIRED',
    httpStatus: 400,
    message: 'Approved payment reference is required',
  },
  PAYMENT_REJECTION_REASON_REQUIRED: {
    code: 'PAYMENT_REJECTION_REASON_REQUIRED',
    httpStatus: 400,
    message: 'Rejection reason is required',
  },
  ONLY_SELLER_MAY_APPROVE: {
    code: 'ONLY_SELLER_MAY_APPROVE',
    httpStatus: 403,
    message: 'Only the seller may approve payment',
  },
  ONLY_SELLER_MAY_REJECT: {
    code: 'ONLY_SELLER_MAY_REJECT',
    httpStatus: 403,
    message: 'Only the seller may reject payment',
  },
  PAYMENT_ALREADY_PROCESSED: {
    code: 'PAYMENT_ALREADY_PROCESSED',
    httpStatus: 400,
    message: 'Payment has already been processed',
  },
  UNKNOWN_PAYMENT_ACTION: {
    code: 'UNKNOWN_PAYMENT_ACTION',
    httpStatus: 400,
    message: 'Unknown payment action',
  },

  // ============================================
  // DELIVERY ERRORS (400, 403, 404)
  // ============================================
  DELIVERY_NOT_FOUND: {
    code: 'DELIVERY_NOT_FOUND',
    httpStatus: 404,
    message: 'Delivery order not found',
  },
  DELIVERY_AGENT_NOT_FOUND: {
    code: 'DELIVERY_AGENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Delivery agent not found',
  },
  DELIVERY_NOT_PLATFORM: {
    code: 'DELIVERY_NOT_PLATFORM',
    httpStatus: 400,
    message: 'Not a platform delivery order',
  },
  DELIVERY_PENDING_ASSIGNMENT: {
    code: 'DELIVERY_PENDING_ASSIGNMENT',
    httpStatus: 400,
    message: 'Delivery order is not pending assignment',
  },
  DELIVERY_UNAUTHORIZED: {
    code: 'DELIVERY_UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to update this delivery',
  },
  ONLY_AGENT_MAY_UPDATE_DELIVERY: {
    code: 'ONLY_AGENT_MAY_UPDATE_DELIVERY',
    httpStatus: 403,
    message: 'Only the assigned agent may update this delivery status',
  },
  ONLY_SELLER_MAY_UPDATE_DELIVERY: {
    code: 'ONLY_SELLER_MAY_UPDATE_DELIVERY',
    httpStatus: 403,
    message: 'Only the seller may update this delivery status',
  },
  DELIVERY_NOT_MANAGED_BY_SERVICE: {
    code: 'DELIVERY_NOT_MANAGED_BY_SERVICE',
    httpStatus: 400,
    message: 'Delivery completion is managed by the delivery service',
  },
  DELIVERY_SELLER_NOT_FOUND: {
    code: 'DELIVERY_SELLER_NOT_FOUND',
    httpStatus: 404,
    message: 'Delivery seller not found',
  },
  DELIVERY_PICKUP_NOT_CONFIGURED: {
    code: 'DELIVERY_PICKUP_NOT_CONFIGURED',
    httpStatus: 400,
    message: 'Seller pickup location is not configured',
  },
  DELIVERY_LOCATION_REQUIRED: {
    code: 'DELIVERY_LOCATION_REQUIRED',
    httpStatus: 400,
    message: 'Latitude and longitude are required',
  },

  // ============================================
  // RESTAURANT/FOOD ERRORS (400, 403, 404)
  // ============================================
  RESTAURANT_NOT_FOUND: {
    code: 'RESTAURANT_NOT_FOUND',
    httpStatus: 404,
    message: 'Restaurant not found',
  },
  RESTAURANT_UNAVAILABLE: {
    code: 'RESTAURANT_UNAVAILABLE',
    httpStatus: 400,
    message: 'Restaurant is not available',
  },
  ONLY_RESTAURANT_OWNERS: {
    code: 'ONLY_RESTAURANT_OWNERS',
    httpStatus: 403,
    message: 'Only restaurant owners can create meals',
  },
  MEAL_NOT_FOUND: {
    code: 'MEAL_NOT_FOUND',
    httpStatus: 404,
    message: 'Meal not found',
  },
  DUPLICATE_MEAL: {
    code: 'DUPLICATE_MEAL',
    httpStatus: 409,
    message: 'Duplicate meal listing',
  },
  RESTAURANT_SUSPENDED: {
    code: 'RESTAURANT_SUSPENDED',
    httpStatus: 403,
    message: 'Restaurant has been suspended',
  },

  // ============================================
  // PROPERTY ERRORS (400, 403, 404)
  // ============================================
  PROPERTY_NOT_FOUND: {
    code: 'PROPERTY_NOT_FOUND',
    httpStatus: 404,
    message: 'Property not found',
  },
  PROPERTY_UNAUTHORIZED: {
    code: 'PROPERTY_UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to access this property',
  },

  // ============================================
  // REVIEW/RATING ERRORS (400, 403, 404)
  // ============================================
  REVIEW_NOT_FOUND: {
    code: 'REVIEW_NOT_FOUND',
    httpStatus: 404,
    message: 'Review not found',
  },
  REVIEW_UNAUTHORIZED: {
    code: 'REVIEW_UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to access this review',
  },

  // ============================================
  // FAVORITE ERRORS (400, 403, 404)
  // ============================================
  FAVORITE_NOT_FOUND: {
    code: 'FAVORITE_NOT_FOUND',
    httpStatus: 404,
    message: 'Favorite not found',
  },
  FAVORITE_UNAUTHORIZED: {
    code: 'FAVORITE_UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to access this favorite',
  },

  // ============================================
  // AGENT ERRORS (400, 403, 404)
  // ============================================
  AGENT_NOT_FOUND: {
    code: 'AGENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Delivery agent not found',
  },

  // ============================================
  // CART ERRORS (400, 403, 404)
  // ============================================
  CART_NOT_FOUND: {
    code: 'CART_NOT_FOUND',
    httpStatus: 404,
    message: 'Cart not found',
  },
  CART_UNAUTHORIZED: {
    code: 'CART_UNAUTHORIZED',
    httpStatus: 403,
    message: 'Unauthorized to access this cart',
  },

  // ============================================
  // CONVERSATION/CHAT ERRORS (404)
  // ============================================
  CONVERSATION_NOT_FOUND: {
    code: 'CONVERSATION_NOT_FOUND',
    httpStatus: 404,
    message: 'Conversation not found',
  },

  // ============================================
  // FILE UPLOAD ERRORS (400)
  // ============================================
  FILE_REQUIRED: {
    code: 'FILE_REQUIRED',
    httpStatus: 400,
    message: 'File is required',
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    httpStatus: 400,
    message: 'Unsupported image type. Use JPG, PNG, or WEBP',
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    httpStatus: 400,
    message: 'File too large. Maximum size: 5MB',
  },
  UNSUPPORTED_FORMAT: {
    code: 'UNSUPPORTED_FORMAT',
    httpStatus: 400,
    message: 'Unsupported file format',
  },

  // ============================================
  // VALIDATION ERRORS (400)
  // ============================================
  INVALID_REQUEST_DATA: {
    code: 'INVALID_REQUEST_DATA',
    httpStatus: 400,
    message: 'Invalid request data',
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    httpStatus: 400,
    message: 'Invalid email address',
  },
  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    httpStatus: 400,
    message: 'Missing required field',
  },
  INVALID_PLAN: {
    code: 'INVALID_PLAN',
    httpStatus: 400,
    message: 'Invalid subscription plan',
  },
  AGENT_AND_PLAN_REQUIRED: {
    code: 'AGENT_AND_PLAN_REQUIRED',
    httpStatus: 400,
    message: 'Agent ID and plan type are required',
  },
  OVERRIDE_ACTION_INVALID: {
    code: 'OVERRIDE_ACTION_INVALID',
    httpStatus: 400,
    message: 'Override action must be approve or reject',
  },

  // ============================================
  // RATE LIMIT ERRORS (429)
  // ============================================
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    message: 'Too many requests. Please try again later',
  },
  LOGIN_RATE_LIMIT_EXCEEDED: {
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    message: 'Too many login attempts. Please wait 15 minutes',
  },
  SELLER_RATE_LIMIT_EXCEEDED: {
    code: 'SELLER_RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    message: 'Seller endpoint rate limit exceeded',
  },
  ADMIN_RATE_LIMIT_EXCEEDED: {
    code: 'ADMIN_RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    message: 'Admin endpoint rate limit exceeded',
  },
  ADMIN_AUTH_RATE_LIMIT_EXCEEDED: {
    code: 'ADMIN_AUTH_RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    message: 'Too many admin auth attempts. Try again later',
  },

  // ============================================
  // SYSTEM/SERVER ERRORS (500)
  // ============================================
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    httpStatus: 500,
    message: 'Something went wrong. Please try again later',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    httpStatus: 500,
    message: 'Database error',
  },
  NOT_IMPLEMENTED: {
    code: 'NOT_IMPLEMENTED',
    httpStatus: 501,
    message: 'This feature is not implemented',
  },

  // ============================================
  // NOT FOUND ERRORS (404)
  // ============================================
  NOT_FOUND: {
    code: 'NOT_FOUND',
    httpStatus: 404,
    message: 'Resource not found',
  },
  ENDPOINT_NOT_FOUND: {
    code: 'ENDPOINT_NOT_FOUND',
    httpStatus: 404,
    message: 'Endpoint not found',
  },
};

module.exports = ERRORS;
