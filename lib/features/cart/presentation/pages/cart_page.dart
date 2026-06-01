import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers.dart';
import '../../../shared/widgets/button_widget.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartControllerProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Cart'),
        actions: [
          IconButton(
            icon: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(Icons.shopping_cart),
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
            onPressed: () {},
          ),
        ],
      ),
      body: cartState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Unable to load cart: ${error.toString()}'),
              const SizedBox(height: 16),
              AppButton(label: 'Retry', onPressed: () => ref.read(cartControllerProvider.notifier).refreshCart()),
            ],
          ),
        ),
        data: (cart) {
          if (cart.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Your cart is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  const Text('Add items from the store to start checkout.'),
                  const SizedBox(height: 24),
                  AppButton(label: 'Browse Products', onPressed: () => context.go('/home')),
                ],
              ),
            );
          }

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    itemCount: cart.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return Card(
                        elevation: 1,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (item.productImage != null)
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(item.productImage!, width: 72, height: 72, fit: BoxFit.cover),
                                )
                              else
                                Container(
                                  width: 72,
                                  height: 72,
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade200,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.shopping_bag_outlined, size: 32, color: Colors.grey),
                                ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.productName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text('$${item.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 14, color: Colors.black87)),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.remove_circle_outline),
                                          onPressed: item.quantity > 1
                                              ? () => ref.read(cartControllerProvider.notifier).updateQuantity(item.productId, item.quantity - 1)
                                              : null,
                                        ),
                                        Text(item.quantity.toString(), style: const TextStyle(fontWeight: FontWeight.w600)),
                                        IconButton(
                                          icon: const Icon(Icons.add_circle_outline),
                                          onPressed: () => ref.read(cartControllerProvider.notifier).updateQuantity(item.productId, item.quantity + 1),
                                        ),
                                        const Spacer(),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                          onPressed: () => ref.read(cartControllerProvider.notifier).removeItem(item.productId),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
                _buildCartSummary(context, ref, cart),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCartSummary(BuildContext context, WidgetRef ref, cart) {
    return Column(
      children: [
        _buildSummaryRow('Subtotal', '$${cart.subtotal.toStringAsFixed(2)}'),
        const SizedBox(height: 8),
        _buildSummaryRow('Delivery fee', '$${cart.deliveryFee.toStringAsFixed(2)}'),
        const SizedBox(height: 8),
        _buildSummaryRow('Total', '$${cart.total.toStringAsFixed(2)}', bold: true),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: AppButton(
                label: 'Clear Cart',
                primary: false,
                onPressed: () => ref.read(cartControllerProvider.notifier).clearCart(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(
                label: 'Checkout',
                onPressed: () => context.go('/checkout/shipping'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool bold = false}) {
    final style = TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [Text(label, style: style), Text(value, style: style)],
    );
  }
}
