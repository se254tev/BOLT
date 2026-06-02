import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/providers.dart';
import 'package:bolt_marketplace/core/navigation/app_router_controller.dart';
import 'package:bolt_marketplace/features/auth/presentation/controllers/auth_controller.dart';

class BecomeSellerPage extends ConsumerWidget {
  const BecomeSellerPage({super.key});

  Future<void> _apply(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(authControllerProvider.notifier).applySeller();
      if (!context.mounted) return;
      final user = ref.read(authControllerProvider).value;
      if (user != null) {
        AppRouterController.instance.navigate(context, user);
      }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Seller application submitted')));
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Become a Seller')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Join Bolt as a seller',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'Seller accounts let you list products, manage inventory, and review orders. '
              'A seller account is reviewed and approved by our team.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24),
            const Text(
              'What to expect:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            const Text('• Submit your seller details during signup.'),
            const Text('• Your account will be verified before seller tools are unlocked.'),
            const Text('• You can manage your listings from the seller dashboard.'),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => _apply(context, ref),
              child: const Text('Apply to become a seller'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => AppRouterController.instance.navigate(context, ref.read(authControllerProvider).value!),
              child: const Text('Back to marketplace'),
            ),
          ],
        ),
      ),
    );
  }
}
