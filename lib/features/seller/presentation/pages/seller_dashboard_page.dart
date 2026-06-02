import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/widgets/require_role.dart';
import '../providers/seller_dashboard_provider.dart';

class SellerDashboardPage extends ConsumerWidget {
  const SellerDashboardPage({super.key});

  Widget _card(String title, String value, Color color) {
    return Card(
      color: color,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white70)),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 24, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(sellerDashboardControllerProvider);

    return RequireRole(
      requiredRole: 'seller',
      child: Scaffold(
        appBar: AppBar(title: const Text('Seller Dashboard')),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: dashboardState.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stackTrace) => Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Failed to load dashboard data.'),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => ref.read(sellerDashboardControllerProvider.notifier).loadDashboard(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
            data: (dashboard) => GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: [
                _card('Total Products', '${dashboard.totalProducts}', Colors.deepPurple),
                _card('Total Properties', '${dashboard.totalProperties}', Colors.indigo),
                _card('Pending Listings', '${dashboard.pendingListings}', Colors.orange),
                _card('Verified Listings', '${dashboard.verifiedListings}', Colors.green),
                _card('Total Reviews', '${dashboard.totalReviews}', Colors.cyan),
                _card('Total Orders', '${dashboard.totalOrders}', Colors.teal),
                _card('Revenue', 'KES ${dashboard.revenue.toStringAsFixed(2)}', Colors.blueGrey),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
