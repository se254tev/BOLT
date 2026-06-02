import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/card_widget.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import '../../domain/entities/service_entities.dart';
import '../../../core/realtime/socket_service.dart';
import '../providers/service_providers.dart';

class ErrandBidsPage extends ConsumerStatefulWidget {
  final String requestId;

  const ErrandBidsPage({required this.requestId, super.key});

  @override
  ConsumerState<ErrandBidsPage> createState() => _ErrandBidsPageState();
}

class _ErrandBidsPageState extends ConsumerState<ErrandBidsPage> {
  List<ServiceBid> _bids = [];
  String? _selectedBidId;

  @override
  void initState() {
    super.initState();
    _connectToSocketEvents();
  }

  void _connectToSocketEvents() {
    final socketService = ref.read(socketServiceProvider);
    if (!socketService.isConnected) {
      socketService.connect();
    }
  }

  Future<void> _selectBid(String bidId, String workerId) async {
    try {
      await ref.read(
        selectBidProvider(
          (requestId: widget.requestId, bidId: bidId),
        ).future,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Shopper selected! Errand in progress.')),
        );
        context.go('/services/errands/status/${widget.requestId}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting worker: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final requestAsync = ref.watch(serviceRequestProvider(widget.requestId));
    final bidsAsync = ref.watch(requestBidsProvider(widget.requestId));

    // Watch real-time bid events
    ref.watch(socketEventFilterProvider('bid_submitted'));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Shoppers'),
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
      body: Column(
        children: [
          requestAsync.when(
            data: (request) => Padding(
              padding: const EdgeInsets.all(16),
              child: AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.title, style: AppTextStyles.h2),
                      const SizedBox(height: 8),
                      Text('Budget: ${request.price?.toStringAsFixed(2) ?? 'N/A'}'),
                      const SizedBox(height: 8),
                      Text(request.description ?? '', style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ),
            loading: () => const Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
            error: (e, st) => Padding(
              padding: const EdgeInsets.all(16),
              child: Text('Error loading request: $e'),
            ),
          ),
          Expanded(
            child: bidsAsync.when(
              data: (bids) {
                if (bids.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.people_outline, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text('No shoppers available yet', style: AppTextStyles.h2),
                        const SizedBox(height: 8),
                        const Text('Waiting for shoppers to submit bids...'),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: bids.length,
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final bid = bids[index];
                    final isSelected = bid.id == _selectedBidId;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppCard(
                        child: InkWell(
                          onTap: () => setState(() => _selectedBidId = bid.id),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    if (bid.workerImage != null)
                                      CircleAvatar(
                                        backgroundImage: NetworkImage(bid.workerImage!),
                                      )
                                    else
                                      const CircleAvatar(child: Icon(Icons.person)),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(bid.workerName ?? 'Shopper', style: AppTextStyles.h2),
                                          if (bid.rating != null)
                                            Text(
                                              '${bid.rating?.toStringAsFixed(1) ?? 'N/A'} ⭐',
                                              style: const TextStyle(fontSize: 12),
                                            ),
                                          if (bid.completedJobs != null)
                                            Text(
                                              '${bid.completedJobs} jobs completed',
                                              style: const TextStyle(fontSize: 12, color: Colors.grey),
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
                                        '${bid.price.toStringAsFixed(2)}',
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                if (bid.message != null) ...[
                                  const SizedBox(height: 8),
                                  Text(bid.message!, style: const TextStyle(fontSize: 12)),
                                ],
                                const SizedBox(height: 12),
                                if (isSelected)
                                  AppButton(
                                    label: 'Confirm Selection',
                                    onPressed: () => _selectBid(bid.id, bid.workerId),
                                  )
                                else
                                  OutlinedButton(
                                    onPressed: () => setState(() => _selectedBidId = bid.id),
                                    child: const Text('Select'),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(
                child: Text('Error loading bids: $e'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
