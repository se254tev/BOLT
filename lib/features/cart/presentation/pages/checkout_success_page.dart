import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';

class CheckoutSuccessPage extends StatelessWidget {
  const CheckoutSuccessPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Confirmed')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.check_circle_outline, size: 96, color: Colors.green),
            const SizedBox(height: 24),
            const Text('Thank you for your order!', textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('Your order has been submitted and is now being processed.', textAlign: TextAlign.center),
            const SizedBox(height: 32),
            AppButton(label: 'Continue Shopping', onPressed: () => context.go('/home')),
            const SizedBox(height: 12),
            AppButton(label: 'View Profile', primary: false, onPressed: () => context.go('/profile')),
          ],
        ),
      ),
    );
  }
}
