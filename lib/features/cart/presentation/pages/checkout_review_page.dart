import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers.dart';
import '../../../../shared/widgets/button_widget.dart';
import '../providers/checkout_provider.dart';

class CheckoutReviewPage extends ConsumerStatefulWidget {
  const CheckoutReviewPage({super.key});

  @override
  ConsumerState<CheckoutReviewPage> createState() => _CheckoutReviewPageState();
}

class _CheckoutReviewPageState extends ConsumerState<CheckoutReviewPage> {
  bool _submitting = false;

  Future<void> _confirmOrder(String cartId, Map<String, dynamic> checkoutData) async {
    setState(() => _submitting = true);
    try {
      await ref.read(cartControllerProvider.notifier).checkout(cartId, checkoutData);
      if (mounted) {
        context.go('/checkout/success');
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Checkout failed: ${error.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final checkoutInfo = ref.watch(checkoutInfoProvider);
    final cartState = ref.watch(cartControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Review Order')),
      body: cartState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Unable to review cart: ${error.toString()}')),
        data: (cart) {
          final checkoutData = {
            'items': cart.items.map((item) => item.toJson()).toList(),
            'total': cart.total,
            'paymentStatus': checkoutInfo.paymentMethod == 'Cash on Delivery' ? 'pending' : 'pending',
            'shippingAddress': checkoutInfo.address,
            'city': checkoutInfo.city,
            'postalCode': checkoutInfo.postalCode,
            'phone': checkoutInfo.phone,
            'paymentMethod': checkoutInfo.paymentMethod,
          };

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Shipping Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Name: ${checkoutInfo.fullName}'),
                Text('Address: ${checkoutInfo.address}, ${checkoutInfo.city}, ${checkoutInfo.postalCode}'),
                Text('Phone: ${checkoutInfo.phone}'),
                const SizedBox(height: 16),
                const Text('Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(checkoutInfo.paymentMethod),
                const SizedBox(height: 16),
                const Text('Items', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    itemCount: cart.items.length,
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(item.productName),
                        subtitle: Text('${item.quantity} × $${item.price.toStringAsFixed(2)}'),
                        trailing: Text('$${item.subtotal.toStringAsFixed(2)}'),
                      );
                    },
                  ),
                ),
                const Divider(),
                _summaryRow('Subtotal', '$${cart.subtotal.toStringAsFixed(2)}'),
                _summaryRow('Delivery', '$${cart.deliveryFee.toStringAsFixed(2)}'),
                _summaryRow('Total', '$${cart.total.toStringAsFixed(2)}', bold: true),
                const SizedBox(height: 16),
                AppButton(
                  label: _submitting ? 'Submitting...' : 'Confirm Order',
                  onPressed: _submitting ? null : () => _confirmOrder(cart.id, checkoutData),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool bold = false}) {
    final style = TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label, style: style), Text(value, style: style)],
      ),
    );
  }
}
