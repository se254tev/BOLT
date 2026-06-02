import 'package:flutter/material.dart';

class OrderHistoryPage extends StatelessWidget {
  const OrderHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Your recent orders', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('Track active deliveries, review purchase history, and manage orders all from one place.'),
            const SizedBox(height: 24),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.history, size: 64, color: Colors.black38),
                    SizedBox(height: 16),
                    Text('No orders yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text('Your orders will appear here once you complete a checkout.'),
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
