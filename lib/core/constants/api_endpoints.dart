enum AppEnvironment { dev, staging, production }

class ApiEndpoints {
  static const String _apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');
  static const String _appEnv = String.fromEnvironment('APP_ENV', defaultValue: 'production');

  static AppEnvironment get environment {
    switch (_appEnv.toLowerCase()) {
      case 'dev':
      case 'development':
        return AppEnvironment.dev;
      case 'staging':
        return AppEnvironment.staging;
      default:
        return AppEnvironment.production;
    }
  }

  static String get baseUrl {
    if (_apiBaseUrl.isNotEmpty) return _apiBaseUrl;
    switch (environment) {
      case AppEnvironment.dev:
        return 'https://bolt-nv0u.onrender.com';
      case AppEnvironment.staging:
        return 'https://staging.bolt.marketplace.com';
      case AppEnvironment.production:
      default:
        return 'https://bolt-nv0u.onrender.com';
    }
  }

  static const String auth = '/api/auth';
  static const String products = '/api/products';
  static const String properties = '/api/properties';
  static const String cart = '/api/cart';
  static const String favorites = '/api/favorites';
  static const String reviews = '/api/reviews';
  static const String chat = '/api/chat';
  static const String users = '/api/users';
  static const String restaurants = '/api/restaurants';
  static const String meals = '/api/meals';
  static const String foodOrders = '/api/food-orders';
  static const String agentSubscription = '/api/agents/subscription';
}

