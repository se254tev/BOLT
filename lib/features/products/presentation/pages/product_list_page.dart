import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/providers.dart';
import 'package:bolt_marketplace/features/auth/presentation/controllers/auth_controller.dart';
import 'package:bolt_marketplace/features/products/presentation/controllers/product_controller.dart';

class ProductListPage extends ConsumerWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productState = ref.watch(productControllerProvider);
    final cartState = ref.watch(cartControllerProvider);
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('BOLT Marketplace'),
        actions: [
          IconButton(
            icon: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(Icons.shopping_cart_outlined),
                if (cartState.maybeWhen(data: (cart) => cart.itemCount > 0, orElse: () => false))
                  Positioned(
                    right: 2,
                    top: 2,
                    child: CircleAvatar(
                      radius: 8,
                      backgroundColor: Colors.redAccent,
                      child: Text(
                        cartState.value!.itemCount.toString(),
                        style: const TextStyle(fontSize: 10, color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () => context.go('/cart'),
          )
        ],
      ),
      body: productState.when(
        data: (products) => ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                child: InkWell(
                  borderRadius: BorderRadius.circular(18),
                  onTap: () => context.go('/product/${product.id}'),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (product.images.isNotEmpty)
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                          child: CachedNetworkImage(
                            imageUrl: product.images.first,
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(child: Text(product.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.black54))),
                                const SizedBox(width: 8),
                                Chip(
                                  label: Text(product.category, style: const TextStyle(fontSize: 12)),
                                  backgroundColor: Colors.grey.shade200,
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                Text('\$${product.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                const Spacer(),
                                Icon(product.verified ? Icons.verified : Icons.pending, color: product.verified ? Colors.green : Colors.orange),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text(error.toString())),
      ),
      floatingActionButton: authState.maybeWhen(
        data: (user) => user?.role == 'seller'
            ? FloatingActionButton(
                onPressed: () => context.go('/seller/dashboard'),
                child: const Icon(Icons.dashboard),
              )
            : null,
        orElse: () => null,
      ),
    );
  }
}
