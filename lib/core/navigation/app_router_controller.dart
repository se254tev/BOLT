import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/features/auth/domain/entities/user.dart';

class AppRouterController {
  static final AppRouterController instance = AppRouterController._();

  AppRouterController._();

  String getInitialRoute(User user) {
    switch (user.role) {
      case 'admin':
        // mobile admin experience is disabled - send to buyer home
        return '/home';
      case 'seller':
        return _getSellerRoute(user);
      case 'buyer':
      default:
        return '/home';
    }
  }

  String _getSellerRoute(User user) {
    final status = (user.sellerStatus ?? 'none');
    switch (status) {
      case 'pending':
        return '/seller/onboarding/pending';
      case 'approved':
        return '/seller/onboarding/complete';
      case 'active':
        return '/seller/dashboard';
      default:
        return '/seller/onboarding/start';
    }
  }

  void navigate(BuildContext context, User user) {
    final route = getInitialRoute(user);
    GoRouter.of(context).go(route);
  }
}
