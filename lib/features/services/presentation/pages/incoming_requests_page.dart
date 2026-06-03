import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/card_widget.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import '../../domain/entities/service_entities.dart';
import 'package:bolt_marketplace/core/realtime/socket_service.dart';
import '../providers/service_providers.dart';

class IncomingRequestsPage extends ConsumerStatefulWidget {
  final String? type;

  const IncomingRequestsPage({this.type, super.key});

  @override
  ConsumerState<IncomingRequestsPage> createState() => _IncomingRequestsPageState();
}

class _IncomingRequestsPageState extends ConsumerState<IncomingRequestsPage> {
  String? _selectedType;

  @override
  void initState() {
    super.initState();
    _selectedType = widget.type;
    final socketService = ref.read(socketServiceProvider);
    if (!socketService.isConnected) {
      socketService.connect();
    }
  }

  String _getTypeIcon(ServiceType type) => type == ServiceType.ride ? '🚗' : '🛍️';

  @override
  Widget build(BuildContext context) {
    final requestsAsync = ref.watch(workerAvailableRequestsProvider(_selectedType));

    // Watch for new requests broadcast
    ref.watch(socketEventFilterProvider('request_broadcast'));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Requests'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: ref.watch(socketConnectedProvider).when(
              data: (connected) => Container(
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
              loading: () => const SizedBox(
                width: 60,
                height: 32,
                child: Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))),
              ),
              error: (_, __) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.grey,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Error',
                  style: TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter tabs
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _selectedType = 'ride'),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: _selectedType == 'ride' ? Colors.black : Colors.transparent,
                      side: BorderSide(
                        color: _selectedType == 'ride' ? Colors.black : Colors.grey,
                      ),
                    ),
                    child: Text(
                      'Rides',
                      style: TextStyle(
                        color: _selectedType == 'ride' ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _selectedType = 'errand'),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: _selectedType == 'errand' ? Colors.black : Colors.transparent,
                      side: BorderSide(
                        color: _selectedType == 'errand' ? Colors.black : Colors.grey,
                      ),
                    ),
                    child: Text(
                      'Errands',
                      style: TextStyle(
                        color: _selectedType == 'errand' ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Requests list
          Expanded(
            child: requestsAsync.when(
              data: (requests) {
                if (requests.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.inbox_outlined, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text('No requests available', style: AppTextStyles.h2),
                        const SizedBox(height: 8),
                        const Text('Check back soon for more opportunities'),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => ref.refresh(workerAvailableRequestsProvider(_selectedType)),
                          child: const Text('Refresh'),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(workerAvailableRequestsProvider(_selectedType)),
                  child: ListView.builder(
                    itemCount: requests.length,
                    padding: const EdgeInsets.all(16),
                    itemBuilder: (context, index) {
                      final request = requests[index];

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: AppCard(
                          child: InkWell(
                            onTap: () => context.push('/services/worker/requests/${request.id}'),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(_getTypeIcon(request.type), style: const TextStyle(fontSize: 24)),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(request.title, style: AppTextStyles.h2),
                                            Text(
                                              request.status.name.toUpperCase(),
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: request.status == RequestStatus.bidding
                                                    ? Colors.orange
                                                    : Colors.blue,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.black,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          '${request.price?.toStringAsFixed(2) ?? 'TBD'}',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    request.description ?? '',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  const SizedBox(height: 12),
                                  AppButton(
                                    label: 'Submit Bid',
                                    onPressed: () => context.push('/services/worker/requests/${request.id}/bid'),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Error loading requests: $e'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.refresh(workerAvailableRequestsProvider(_selectedType)),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
