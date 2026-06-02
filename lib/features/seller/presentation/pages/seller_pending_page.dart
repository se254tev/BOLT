import 'package:flutter/material.dart';

class SellerPendingPage extends StatelessWidget {
  const SellerPendingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Seller Application')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.hourglass_top, size: 64, color: Colors.orange),
            SizedBox(height: 16),
            Text("Your seller application is under review", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('We will notify you when the review completes.'),
          ],
        ),
      ),
    );
  }
}
