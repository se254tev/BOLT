import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers.dart';
import '../providers/product_detail_provider.dart';
import '../../../../shared/widgets/button_widget.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailPage({required this.productId, super.key});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  int _quantity = 1;
  bool _checkoutLoading = false;

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _addToCart(String productId, String productName, double price, String? image) async {
    if (_checkoutLoading) return;
    setState(() => _checkoutLoading = true);
    try {
      await ref.read(cartControllerProvider.notifier).addItem(
            productId,
            _quantity,
            productName: productName,
            price: price,
            image: image,
          );
      _showSnack('Added $_quantity item${_quantity == 1 ? '' : 's'} to cart');
    } catch (err) {
      _showSnack('Failed to add item to cart');
    } finally {
      setState(() => _checkoutLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detailState = ref.watch(productDetailProvider(widget.productId));
    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
        actions: [
          IconButton(icon: const Icon(Icons.shopping_cart_outlined), onPressed: () => context.go('/cart')),
        ],
      ),
      body: detailState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Unable to load product: ${error.toString()}')),
        data: (product) {
          final imageUrl = product.images.isNotEmpty ? product.images.first : null;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (imageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.network(imageUrl, height: 260, width: double.infinity, fit: BoxFit.cover),
                  ),
                const SizedBox(height: 16),
                Text(product.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('$${product.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, color: Colors.black87)),
                const SizedBox(height: 12),
                Text(product.description, style: const TextStyle(fontSize: 16, color: Colors.black54)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline),
                      onPressed: _quantity > 1 ? () => setState(() => _quantity -= 1) : null,
                    ),
                    Text(_quantity.toString(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(Icons.add_circle_outline),
                      onPressed: () => setState(() => _quantity += 1),
                    ),
                    const Spacer(),
                    Text('Subtotal: $${(product.price * _quantity).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: _checkoutLoading ? 'Adding...' : 'Add to Cart',
                  onPressed: _checkoutLoading ? null : () => _addToCart(product.id, product.name, product.price, imageUrl),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
