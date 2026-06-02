import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/card_widget.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import '../../../core/realtime/socket_service.dart';
import '../providers/service_providers.dart';

class WorkerDashboardPage extends ConsumerStatefulWidget {
  const WorkerDashboardPage({super.key});

  @override
  ConsumerState<WorkerDashboardPage> createState() => _WorkerDashboardPageState();
}

class _WorkerDashboardPageState extends ConsumerState<WorkerDashboardPage> {
  @override
  void initState() {
    super.initState();
    final socketService = ref.read(socketServiceProvider);
    if (!socketService.isConnected) {
      socketService.connect();
    }
  }

  @override
  Widget build(BuildContext context) {
    final workerProfileAsync = ref.watch(workerProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Dashboard'),
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
            // Welcome section
            workerProfileAsync.when(
              data: (profile) => AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Welcome Back!', style: AppTextStyles.h2),
                      const SizedBox(height: 8),
                      Text('${profile['name'] ?? 'Worker'}'),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${profile['completedJobs'] ?? 0}', style: AppTextStyles.h1),
                              const Text('Jobs Completed'),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${profile['rating']?.toStringAsFixed(1) ?? 'N/A'} ⭐', style: AppTextStyles.h1),
                              const Text('Rating'),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              loading: () => const AppCard(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (e, st) => AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Error loading profile: $e'),
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Quick actions
            const Text('Find Work', style: AppTextStyles.h2),
            const SizedBox(height: 12),
            AppButton(
              label: 'View Available Rides',
              onPressed: () => context.push('/services/worker/requests?type=ride'),
            ),
            const SizedBox(height: 12),
            AppButton(
              label: 'View Available Errands',
              onPressed: () => context.push('/services/worker/requests?type=errand'),
            ),
            const SizedBox(height: 24),
            // Active jobs section
            const Text('Your Active Jobs', style: AppTextStyles.h2),
            const SizedBox(height: 12),
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('No active jobs at the moment'),
                    const SizedBox(height: 12),
                    const Text('Once you accept a request, it will appear here.', style: TextStyle(fontSize: 12)),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => context.push('/services/worker/requests'),
                      child: const Text('Browse Available Work'),
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
