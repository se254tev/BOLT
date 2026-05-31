import 'package:flutter/material.dart';

class SellerDashboardPage extends StatelessWidget {
  const SellerDashboardPage({super.key});

  Widget _card(String title, String value, Color color) {
    return Card(
      color: color,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white70)),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 24, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Seller Dashboard')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: [
            _card('Total Products', '120', Colors.deepPurple),
            _card('Total Properties', '58', Colors.indigo),
            _card('Pending Listings', '12', Colors.orange),
            _card('Verified Listings', '166', Colors.green),
            _card('Total Reviews', '484', Colors.cyan),
          ],
        ),
      ),
    );
  }
}
