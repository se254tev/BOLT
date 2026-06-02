import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';

class AppShellPage extends StatelessWidget {
  final Widget child;
  const AppShellPage({required this.child, super.key});

  static const _tabRoutes = [
    '/home',
    '/categories',
    '/cart',
    '/orders',
    '/services',
    '/profile',
  ];

  int _activeIndex(String location) {
    final index = _tabRoutes.indexWhere(location.startsWith);
    return index == -1 ? 0 : index;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouter.of(context).location;
    final currentIndex = _activeIndex(location);

    return Scaffold(
      body: child,
      backgroundColor: AppColors.background,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: Colors.grey.shade600,
        elevation: 16,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.grid_view), label: 'Categories'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart_outlined), label: 'Cart'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.directions_car_outlined), label: 'Services'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
        onTap: (index) {
          final route = _tabRoutes[index];
          if (route != location) {
            context.go(route);
          }
        },
      ),
    );
  }
}
