import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/providers.dart';

class SellerCompleteSetupPage extends ConsumerWidget {
  const SellerCompleteSetupPage({super.key});

  Future<void> _activateSeller(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(authRepositoryProvider).activateSeller();
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Seller activated')));
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Activation failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Seller Setup')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Finish your seller profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('Add the remaining details to activate your seller account.'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => _activateSeller(context, ref),
              child: const Text('Activate Account'),
            ),
          ],
        ),
      ),
    );
  }
}
