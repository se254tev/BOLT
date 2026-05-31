import 'package:flutter/material.dart';

class ProductDetailPage extends StatelessWidget {
  final String productId;
  const ProductDetailPage({required this.productId, super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Product Details')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Detail page for product', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text('Product ID: $productId'),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: () {}, child: const Text('Add to Favorites')),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: () {}, child: const Text('Add to Cart')),
          ],
        ),
      ),
    );
  }
}
