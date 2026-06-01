import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/widgets/button_widget.dart';
import '../../../../core/providers.dart';

class PendingPaymentsPage extends ConsumerStatefulWidget {
  const PendingPaymentsPage({super.key});

  @override
  ConsumerState<PendingPaymentsPage> createState() => _PendingPaymentsPageState();
}

class _PendingPaymentsPageState extends ConsumerState<PendingPaymentsPage> {
  bool _loading = true;
  List<dynamic> _orders = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; });
    try {
      final dio = ref.read(dioClientProvider).dio;
      final resp = await dio.get('/api/orders/seller/pending');
      setState(() { _orders = resp.data['orders'] as List<dynamic>; });
    } catch (e) {
      // ignore: avoid_print
      print('Failed to load pending: $e');
    } finally {
      setState(() { _loading = false; });
    }
  }

  Future<void> _approve(String id) async {
    final dio = ref.read(dioClientProvider).dio;
    await dio.post('/api/orders/$id/approve-payment');
    await _load();
  }

  Future<void> _reject(String id) async {
    final reasonController = TextEditingController();
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Reject Payment'),
      content: TextField(controller: reasonController, decoration: const InputDecoration(labelText: 'Reason')),
      actions: [TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')), TextButton(onPressed: () => Navigator.of(ctx).pop(true), child: const Text('Reject'))],
    ));
    if (ok != true) return;
    final dio = ref.read(dioClientProvider).dio;
    await dio.post('/api/orders/$id/reject-payment', data: {'rejectionReason': reasonController.text});
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pending Payments')),
      body: _loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: ListView.separated(
          padding: const EdgeInsets.all(12),
          itemCount: _orders.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final o = _orders[index];
            final id = o['_id'] ?? o['id'] ?? '';
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Order: $id', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Buyer: ${o['buyerId'] ?? ''}'),
                  Text('Amount: ${o['totalAmount'] ?? o['total'] ?? ''}'),
                  const SizedBox(height: 8),
                  if (o['payment'] != null) Text('Transaction: ${o['payment']['transactionCode'] ?? ''}'),
                  if (o['payment'] != null && o['payment']['screenshotUrl'] != null) Image.network(o['payment']['screenshotUrl']),
                  const SizedBox(height: 8),
                  Row(children: [
                    AppButton(label: 'Approve', onPressed: () => _approve(id)),
                    const SizedBox(width: 8),
                    AppButton(label: 'Reject', primary: false, onPressed: () => _reject(id)),
                  ])
                ]),
              ),
            );
          },
        ),
      ),
    );
  }
}
