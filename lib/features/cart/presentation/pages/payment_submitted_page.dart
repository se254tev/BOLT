import 'package:flutter/material.dart';

class PaymentSubmittedPage extends StatelessWidget {
  const PaymentSubmittedPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment Submitted')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.hourglass_top, size: 64, color: Colors.orange),
              SizedBox(height: 12),
              Text('Payment submitted', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              SizedBox(height: 8),
              Text('Waiting for seller confirmation.'),
            ],
          ),
        ),
      ),
    );
  }
}
