import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers.dart';
import '../../domain/entities/product.dart';
import '../controllers/product_controller.dart';

class ProductListPage extends ConsumerWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productState = ref.watch(productControllerProvider);
    final cartState = ref.watch(cartControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('BOLT Home'),
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
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            return ListTile(
              leading: product.images.isNotEmpty
                  ? CachedNetworkImage(imageUrl: product.images.first, width: 64, fit: BoxFit.cover)
                  : const SizedBox(width: 64, child: Icon(Icons.shopping_bag)),
              title: Text(product.name),
              subtitle: Text('\$${product.price.toStringAsFixed(2)}'),
              trailing: Icon(product.verified ? Icons.verified : Icons.pending, color: product.verified ? Colors.green : Colors.orange),
              onTap: () => context.go('/product/${product.id}'),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text(error.toString())),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(context).pushNamed('/seller/dashboard'),
        child: const Icon(Icons.dashboard),
      ),
    );
  }
}
