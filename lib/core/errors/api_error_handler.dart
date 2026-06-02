import 'package:dio/dio.dart';

/// Centralized API Error Model for Flutter
/// Maps backend error codes to user-friendly messages

class ApiError {
  final String code;
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? context;

  ApiError({
    required this.code,
    required this.message,
    this.statusCode,
    this.context,
  });

  /// Factory to create ApiError from exception
  factory ApiError.from(dynamic error) {
    if (error is ApiError) {
      return error;
    }

    if (error is DioException) {
      return ApiError._fromDioError(error);
    }

    return ApiError(
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: null,
    );
  }

  /// Create from Dio error response
  factory ApiError._fromDioError(DioException dioError) {
    try {
      final statusCode = dioError.response?.statusCode;
      final data = dioError.response?.data as Map<String, dynamic>?;

      // Parse backend error response format
      final code = data?['code'] ?? 'UNKNOWN_ERROR';
      final message = data?['message'] ?? dioError.message ?? 'An error occurred';
      final context = data?['context'] as Map<String, dynamic>?;

      return ApiError(
        code: code,
        message: message,
        statusCode: statusCode,
        context: context,
      );
    } catch (_) {
      return ApiError(
        code: 'REQUEST_ERROR',
        message: 'Network request failed',
        statusCode: dioError.response?.statusCode,
      );
    }
  }

  @override
  String toString() => 'ApiError($code: $message)';
}

/// Error Code Constants (matching backend ERRORS enum)
class ErrorCodes {
  // Authentication
  static const String authenticationRequired = 'AUTHENTICATION_REQUIRED';
  static const String invalidToken = 'INVALID_TOKEN';
  static const String tokenRevoked = 'TOKEN_REVOKED';
  static const String sessionExpired = 'SESSION_EXPIRED';
  static const String invalidRefreshToken = 'INVALID_REFRESH_TOKEN';
  static const String invalidCredentials = 'INVALID_CREDENTIALS';

  // Authorization
  static const String authorizationRequired = 'AUTHORIZATION_REQUIRED';
  static const String insufficientPrivileges = 'INSUFFICIENT_PRIVILEGES';
  static const String accountDisabled = 'ACCOUNT_DISABLED';

  // User/Product/Order Errors
  static const String userNotFound = 'USER_NOT_FOUND';
  static const String productNotFound = 'PRODUCT_NOT_FOUND';
  static const String orderNotFound = 'ORDER_NOT_FOUND';
  static const String paymentNotFound = 'PAYMENT_NOT_FOUND';

  // Payment
  static const String paymentProofRequired = 'PAYMENT_PROOF_REQUIRED';
  static const String transactionCodeRequired = 'TRANSACTION_CODE_REQUIRED';

  // Validation
  static const String invalidRequestData = 'INVALID_REQUEST_DATA';
  static const String invalidIdentifier = 'INVALID_IDENTIFIER';

  // Rate Limiting
  static const String rateLimitExceeded = 'RATE_LIMIT_EXCEEDED';
  static const String loginRateLimitExceeded = 'LOGIN_RATE_LIMIT_EXCEEDED';

  // System
  static const String internalServerError = 'INTERNAL_SERVER_ERROR';
  static const String notFound = 'NOT_FOUND';
}

/// Error Handler - Converts error codes to user-friendly messages
class ErrorHandler {
  /// Get user-friendly error message for a given error code
  static String getUserMessage(String code) {
    switch (code) {
      // Authentication errors
      case ErrorCodes.authenticationRequired:
        return 'Please log in to continue';
      case ErrorCodes.invalidToken:
      case ErrorCodes.tokenRevoked:
        return 'Your session has expired. Please log in again';
      case ErrorCodes.sessionExpired:
        return 'Your session has expired. Please log in again';
      case ErrorCodes.invalidRefreshToken:
        return 'Please log in again';
      case ErrorCodes.invalidCredentials:
        return 'Invalid email or password';

      // Authorization errors
      case ErrorCodes.accountDisabled:
        return 'Your account has been disabled';
      case ErrorCodes.insufficientPrivileges:
        return 'You do not have permission for this action';

      // Not found errors
      case ErrorCodes.userNotFound:
        return 'User not found';
      case ErrorCodes.productNotFound:
        return 'Product is no longer available';
      case ErrorCodes.orderNotFound:
        return 'Order not found';
      case ErrorCodes.paymentNotFound:
        return 'Payment record not found';

      // Payment errors
      case ErrorCodes.paymentProofRequired:
        return 'Please provide payment proof';
      case ErrorCodes.transactionCodeRequired:
        return 'Please enter transaction code';

      // Validation errors
      case ErrorCodes.invalidRequestData:
        return 'Please check your input and try again';
      case ErrorCodes.invalidIdentifier:
        return 'Invalid identifier';

      // Rate limiting
      case ErrorCodes.rateLimitExceeded:
        return 'Too many requests. Please try again later';
      case ErrorCodes.loginRateLimitExceeded:
        return 'Too many login attempts. Please try again in 15 minutes';

      // Server errors
      case ErrorCodes.internalServerError:
        return 'Something went wrong. Please try again later';

      default:
        return 'An error occurred. Please try again';
    }
  }

  /// Check if error requires re-authentication
  static bool requiresReauth(String code) {
    return {
      ErrorCodes.authenticationRequired,
      ErrorCodes.invalidToken,
      ErrorCodes.tokenRevoked,
      ErrorCodes.sessionExpired,
      ErrorCodes.invalidRefreshToken,
    }.contains(code);
  }

  /// Check if error is rate limit
  static bool isRateLimit(String code) {
    return {
      ErrorCodes.rateLimitExceeded,
      ErrorCodes.loginRateLimitExceeded,
    }.contains(code);
  }

  /// Check if error is retriable
  static bool isRetriable(String code) {
    return {
      ErrorCodes.rateLimitExceeded,
      ErrorCodes.loginRateLimitExceeded,
      ErrorCodes.internalServerError,
    }.contains(code);
  }
}
