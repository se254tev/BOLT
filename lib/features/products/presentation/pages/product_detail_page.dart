import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:bolt_marketplace/core/services/analytics_service.dart';
import 'package:bolt_marketplace/core/providers.dart';
import 'package:bolt_marketplace/features/products/presentation/providers/product_detail_provider.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailPage({required this.productId, super.key});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  final int _quantity = 1;
  bool _checkoutLoading = false;

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _requestContact(String productId, String? sellerId, String channel) async {
    await AnalyticsService.trackContactClick(productId: productId, sellerId: sellerId, type: channel);
    _showSnack('We recorded your request. The seller will be notified.');
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
          final sellerName = product.sellerName ?? 'Seller';
          final sellerId = product.sellerId;

          final hasSellerContact = sellerId.isNotEmpty;
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 160),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (imageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      height: 300,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (ctx, _) => Container(height: 300, color: Colors.grey.shade200),
                      errorWidget: (ctx, _, __) => Container(height: 300, color: Colors.grey.shade200, child: const Icon(Icons.broken_image)),
                    ),
                  ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          Text(product.category, style: const TextStyle(color: Colors.black54)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(14)),
                      child: Text('\$${product.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                if (product.verified)
                  Row(
                    children: const [
                      Icon(Icons.verified, color: Colors.green, size: 18),
                      SizedBox(width: 8),
                      Text('Verified seller', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
                    ],
                  ),
                const SizedBox(height: 24),
                const Text('Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Text(product.description, style: const TextStyle(fontSize: 16, color: Colors.black87, height: 1.5)),
                const SizedBox(height: 24),
                Card(
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Seller', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const CircleAvatar(child: Icon(Icons.store, color: Colors.white)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(sellerName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 4),
                                  const Text('Contact details are private', style: TextStyle(color: Colors.black54)),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.phone, color: Colors.blueAccent),
                              onPressed: () {
                                final product = detailState.maybeWhen(data: (p) => p, orElse: () => null);
                                if (product != null) _requestContact(product.id, sellerId, 'phone');
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        const Text('Need help with your order?', style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Text(
                          hasSellerContact
                              ? 'Tap chat to request contact details and notify the seller.'
                              : 'Seller contact is not available for this item.',
                          style: const TextStyle(color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
        child: Row(
          children: [
            Expanded(
              child: AppButton(
                label: _checkoutLoading ? 'Adding...' : 'Add to Cart',
                onPressed: _checkoutLoading
                    ? null
                    : () {
                        final product = detailState.maybeWhen(data: (p) => p, orElse: () => null);
                        if (product != null) {
                          _addToCart(product.id, product.name, product.price, product.images.isNotEmpty ? product.images.first : null);
                        }
                      },
              ),
            ),
            const SizedBox(width: 12),
              OutlinedButton(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: detailState.maybeWhen(
                data: (product) => () => _requestContact(product.id, product.sellerId, 'whatsapp'),
                orElse: () => null,
              ),
                child: const Text('Chat'),
            ),
          ],
        ),
      ),
    );
  }
}
