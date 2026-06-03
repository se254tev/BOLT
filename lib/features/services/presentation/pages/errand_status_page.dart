import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/card_widget.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import '../../domain/entities/service_entities.dart';
import 'package:bolt_marketplace/core/realtime/socket_service.dart';
import '../providers/service_providers.dart';

class ErrandStatusPage extends ConsumerStatefulWidget {
  final String requestId;

  const ErrandStatusPage({required this.requestId, super.key});

  @override
  ConsumerState<ErrandStatusPage> createState() => _ErrandStatusPageState();
}

class _ErrandStatusPageState extends ConsumerState<ErrandStatusPage> {
  bool _isCompleting = false;
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    final socketService = ref.read(socketServiceProvider);
    if (!socketService.isConnected) {
      socketService.connect();
    }
  }

  Future<void> _completeErrand() async {
    setState(() => _isCompleting = true);
    try {
      await ref.read(completeRequestProvider(widget.requestId).future);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Errand completed! Leave a review')),
        );
        context.go('/services/errands/review/${widget.requestId}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCompleting = false);
    }
  }

  Future<void> _cancelErrand() async {
    final shouldCancel = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Errand?'),
        content: const Text('Are you sure you want to cancel this errand?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (shouldCancel != true) return;

    setState(() => _isCancelling = true);
    try {
      await ref.read(cancelRequestProvider((widget.requestId, null)).future);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Errand cancelled')),
        );
        context.go('/services/errands/create');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCancelling = false);
    }
  }

  String _getStatusDisplay(RequestStatus status) {
    switch (status) {
      case RequestStatus.open:
        return 'Finding Shoppers...';
      case RequestStatus.bidding:
        return 'Reviewing Bids';
      case RequestStatus.assigned:
        return 'Shopper Assigned';
      case RequestStatus.completed:
        return 'Completed';
      case RequestStatus.cancelled:
        return 'Cancelled';
    }
  }

  Color _getStatusColor(RequestStatus status) {
    switch (status) {
      case RequestStatus.open:
        return Colors.blue;
      case RequestStatus.bidding:
        return Colors.orange;
      case RequestStatus.assigned:
        return Colors.green;
      case RequestStatus.completed:
        return Colors.green;
      case RequestStatus.cancelled:
        return Colors.red;
    }
  }

  @override
  Widget build(BuildContext context) {
    final requestAsync = ref.watch(serviceRequestProvider(widget.requestId));
    
    // Watch for real-time updates
    ref.watch(socketEventFilterProvider('request_completed'));
    ref.watch(socketEventFilterProvider('request_cancelled'));
    ref.watch(socketEventFilterProvider('request_assigned'));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Errand Status'),
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
      body: requestAsync.when(
        data: (request) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Status card
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: _getStatusColor(request.status),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _getStatusDisplay(request.status),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(request.title, style: AppTextStyles.h1),
                      const SizedBox(height: 8),
                      Text(request.description ?? '', style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Timeline
              if (request.status != RequestStatus.cancelled) ...[
                const Text('Errand Progress', style: AppTextStyles.h2),
                const SizedBox(height: 16),
                _buildTimelineItem('Request Created', true),
                _buildTimelineItem('Shoppers Bidding', request.status != RequestStatus.open),
                _buildTimelineItem('Shopper Selected', request.status.index >= RequestStatus.assigned.index),
                _buildTimelineItem('Errand Completed', request.status == RequestStatus.completed),
                const SizedBox(height: 24),
              ],
              // Request details
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Details', style: AppTextStyles.h2),
                      const SizedBox(height: 12),
                      _buildDetailRow('Budget', '${request.price?.toStringAsFixed(2) ?? 'N/A'}'),
                      _buildDetailRow('Status', _getStatusDisplay(request.status)),
                      _buildDetailRow(
                        'Created',
                        '${request.createdAt.hour}:${request.createdAt.minute.toString().padLeft(2, '0')}',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              if (request.status == RequestStatus.assigned) ...[
                AppButton(
                  label: _isCompleting ? 'Completing...' : 'Complete Errand',
                  onPressed: _isCompleting ? null : _completeErrand,
                ),
                const SizedBox(height: 12),
              ],
              if (request.status != RequestStatus.completed && request.status != RequestStatus.cancelled)
                OutlinedButton(
                  onPressed: _isCancelling ? null : _cancelErrand,
                  child: Text(_isCancelling ? 'Cancelling...' : 'Cancel Errand'),
                ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Error: $e'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(serviceRequestProvider(widget.requestId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimelineItem(String label, bool isCompleted) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCompleted ? Colors.green : Colors.grey.shade300,
            ),
            child: isCompleted ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
          ),
          const SizedBox(width: 12),
          Text(label),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
