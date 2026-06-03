import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/features/auth/presentation/pages/login_page.dart';
import 'package:bolt_marketplace/features/auth/presentation/pages/register_page.dart';
import 'package:bolt_marketplace/features/auth/presentation/pages/profile_page.dart';
import 'package:bolt_marketplace/features/navigation/presentation/pages/app_shell_page.dart';
import 'package:bolt_marketplace/features/navigation/presentation/pages/categories_page.dart';
import 'package:bolt_marketplace/features/navigation/presentation/pages/order_history_page.dart';
import 'package:bolt_marketplace/features/seller/presentation/pages/become_seller_page.dart';
import 'package:bolt_marketplace/features/seller/presentation/pages/seller_pending_page.dart';
import 'package:bolt_marketplace/features/seller/presentation/pages/seller_complete_setup_page.dart';
import 'package:bolt_marketplace/features/cart/presentation/pages/cart_page.dart';
import 'package:bolt_marketplace/features/cart/presentation/pages/checkout_payment_page.dart';
import 'package:bolt_marketplace/features/cart/presentation/pages/checkout_review_page.dart';
import 'package:bolt_marketplace/features/cart/presentation/pages/checkout_shipping_page.dart';
import 'package:bolt_marketplace/features/cart/presentation/pages/checkout_success_page.dart';
import 'package:bolt_marketplace/features/products/presentation/pages/product_list_page.dart';
import 'package:bolt_marketplace/features/products/presentation/pages/product_detail_page.dart';
import 'package:bolt_marketplace/features/seller/presentation/pages/seller_dashboard_page.dart';
import 'package:bolt_marketplace/features/seller/presentation/pages/pending_payments_page.dart';
import 'package:bolt_marketplace/features/cart/presentation/pages/payment_submitted_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/create_ride_request_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/ride_bids_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/ride_status_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/create_errand_request_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/errand_bids_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/errand_status_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/worker_dashboard_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/incoming_requests_page.dart';
import 'package:bolt_marketplace/features/services/presentation/pages/services_hub_page.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();

  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterPage()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, child) => AppShellPage(child: child),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/home', builder: (context, state) => const ProductListPage()),
              GoRoute(path: '/categories', builder: (context, state) => const CategoriesPage()),
              GoRoute(path: '/cart', builder: (context, state) => const CartPage()),
              GoRoute(path: '/orders', builder: (context, state) => const OrderHistoryPage()),
              GoRoute(path: '/profile', builder: (context, state) => const ProfilePage()),
              GoRoute(path: '/product/:id', builder: (context, state) {
                final id = state.pathParameters['id'] ?? '';
                return ProductDetailPage(productId: id);
              }),
            ],
          ),
        ],
      ),
      GoRoute(path: '/seller/dashboard', builder: (context, state) => const SellerDashboardPage()),
      GoRoute(path: '/seller/pending-payments', builder: (context, state) => const PendingPaymentsPage()),
      GoRoute(path: '/seller/onboarding/start', builder: (context, state) => const BecomeSellerPage()),
      GoRoute(path: '/seller/onboarding/pending', builder: (context, state) => const SellerPendingPage()),
      GoRoute(path: '/seller/onboarding/complete', builder: (context, state) => const SellerCompleteSetupPage()),
      GoRoute(path: '/checkout/shipping', builder: (context, state) => const CheckoutShippingPage()),
      GoRoute(path: '/checkout/payment', builder: (context, state) => const CheckoutPaymentPage()),
      GoRoute(path: '/checkout/review', builder: (context, state) => const CheckoutReviewPage()),
      GoRoute(path: '/checkout/success', builder: (context, state) => const CheckoutSuccessPage()),
      GoRoute(path: '/checkout/submitted', builder: (context, state) => const PaymentSubmittedPage()),
      // Service routes - Hub
      GoRoute(path: '/services', builder: (context, state) => const ServicesHubPage()),
      // Service routes - Rides
      GoRoute(path: '/services/rides/create', builder: (context, state) => const CreateRideRequestPage()),
      GoRoute(
        path: '/services/rides/bids/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return RideBidsPage(requestId: id);
        },
      ),
      GoRoute(
        path: '/services/rides/status/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return RideStatusPage(requestId: id);
        },
      ),
      // Service routes - Errands
      GoRoute(path: '/services/errands/create', builder: (context, state) => const CreateErrandRequestPage()),
      GoRoute(
        path: '/services/errands/bids/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return ErrandBidsPage(requestId: id);
        },
      ),
      GoRoute(
        path: '/services/errands/status/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return ErrandStatusPage(requestId: id);
        },
      ),
      // Service routes - Worker
      GoRoute(path: '/services/worker/dashboard', builder: (context, state) => const WorkerDashboardPage()),
      GoRoute(
        path: '/services/worker/requests',
        builder: (context, state) {
          final type = state.queryParameters['type'];
          return IncomingRequestsPage(type: type);
        },
      ),
      GoRoute(
        path: '/services/worker/requests/:id',
        builder: (context, state) {
          return IncomingRequestsPage();
        },
      ),
      GoRoute(
        path: '/services/worker/requests/:id/bid',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return Scaffold(
            appBar: AppBar(title: const Text('Submit Bid')),
            body: Center(
              child: Text('Bid sheet should open as modal for request: $id'),
            ),
          );
        },
      ),
    ],
  );
}
