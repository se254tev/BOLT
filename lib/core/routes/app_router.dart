import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/admin/presentation/pages/admin_dashboard_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/profile_page.dart';
import '../../features/cart/presentation/pages/cart_page.dart';
import '../../features/cart/presentation/pages/checkout_payment_page.dart';
import '../../features/cart/presentation/pages/checkout_review_page.dart';
import '../../features/cart/presentation/pages/checkout_shipping_page.dart';
import '../../features/cart/presentation/pages/checkout_success_page.dart';
import '../../features/products/presentation/pages/product_list_page.dart';
import '../../features/products/presentation/pages/product_detail_page.dart';
import '../../features/seller/presentation/pages/seller_dashboard_page.dart';
import '../../features/seller/presentation/pages/pending_payments_page.dart';
import '../../features/cart/presentation/pages/payment_submitted_page.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterPage()),
      GoRoute(path: '/home', builder: (context, state) => const ProductListPage()),
      GoRoute(path: '/cart', builder: (context, state) => const CartPage()),
      GoRoute(path: '/checkout/shipping', builder: (context, state) => const CheckoutShippingPage()),
      GoRoute(path: '/checkout/payment', builder: (context, state) => const CheckoutPaymentPage()),
      GoRoute(path: '/checkout/review', builder: (context, state) => const CheckoutReviewPage()),
      GoRoute(path: '/checkout/success', builder: (context, state) => const CheckoutSuccessPage()),
      GoRoute(path: '/profile', builder: (context, state) => const ProfilePage()),
      GoRoute(path: '/product/:id', builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ProductDetailPage(productId: id);
      }),
      GoRoute(path: '/seller/dashboard', builder: (context, state) => const SellerDashboardPage()),
      GoRoute(path: '/seller/pending-payments', builder: (context, state) => const PendingPaymentsPage()),
      GoRoute(path: '/checkout/submitted', builder: (context, state) => const PaymentSubmittedPage()),
      GoRoute(path: '/admin/dashboard', builder: (context, state) => const AdminDashboardPage()),
    ],
  );
}
