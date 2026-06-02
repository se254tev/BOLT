import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/card_widget.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import '../../../core/realtime/socket_service.dart';
import '../providers/service_providers.dart';

class ServicesHubPage extends ConsumerStatefulWidget {
  const ServicesHubPage({super.key});

  @override
  ConsumerState<ServicesHubPage> createState() => _ServicesHubPageState();
}

class _ServicesHubPageState extends ConsumerState<ServicesHubPage> {
  @override
  void initState() {
    super.initState();
    // Ensure socket is connected when entering services
    final socketService = ref.read(socketServiceProvider);
    if (!socketService.isConnected) {
      socketService.connect();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Services'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: ref.watch(socketConnectedProvider).whenData(
                  (connected) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: connected ? Colors.green : Colors.grey,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      connected ? 'Live' : 'Offline',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('What do you need?', style: AppTextStyles.h1),
            const SizedBox(height: 8),
            const Text('Choose a service to get started', style: TextStyle(fontSize: 14, color: Colors.grey)),
            const SizedBox(height: 24),
            // Request Services
            const Text('Request a Service', style: AppTextStyles.h2),
            const SizedBox(height: 12),
            AppCard(
              child: InkWell(
                onTap: () => context.go('/services/rides/create'),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.blue.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.directions_car, size: 32, color: Colors.blue),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Request a Ride', style: AppTextStyles.h2),
                            const SizedBox(height: 4),
                            const Text('Get a driver to take you anywhere', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 8),
                            const Text('Tap to request →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: InkWell(
                onTap: () => context.go('/services/errands/create'),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.orange.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.shopping_bag, size: 32, color: Colors.orange),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Request an Errand', style: AppTextStyles.h2),
                            const SizedBox(height: 4),
                            const Text('Get someone to shop or deliver', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 8),
                            const Text('Tap to request →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Worker Mode
            const Text('Work & Earn', style: AppTextStyles.h2),
            const SizedBox(height: 12),
            AppCard(
              child: InkWell(
                onTap: () => context.go('/services/worker/dashboard'),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.green.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.work, size: 32, color: Colors.green),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Work as a Rider/Shopper', style: AppTextStyles.h2),
                            const SizedBox(height: 4),
                            const Text('Browse jobs and earn money', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 8),
                            const Text('Tap to view jobs →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Info section
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Real-Time Updates', style: AppTextStyles.h2),
                    const SizedBox(height: 8),
                    const Text(
                      'All requests and bids are updated in real-time. You\'ll see new bids as riders/shoppers submit them.',
                      style: TextStyle(fontSize: 12),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 16),
                        const SizedBox(width: 8),
                        const Text('Secure & Reliable', style: TextStyle(fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 16),
                        const SizedBox(width: 8),
                        const Text('Rated Workers', style: TextStyle(fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
