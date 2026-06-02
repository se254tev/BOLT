import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart';
import '../../domain/entities/cart.dart';
import '../../domain/repositories/cart_repository.dart';

class CartController extends StateNotifier<AsyncValue<Cart>> {
  final CartRepository cartRepository;

  CartController({required this.cartRepository}) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    try {
      final cart = await cartRepository.getCart();
      state = AsyncValue.data(cart);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }

  Future<void> addItem(String productId, int quantity, {String? productName, double? price, String? image}) async {
    final currentState = state;
    try {
      state = const AsyncValue.loading();
      final updatedCart = await cartRepository.addItem(
        productId,
        quantity,
        productName: productName,
        price: price,
        image: image,
      );
      state = AsyncValue.data(updatedCart);
    } catch (err, stack) {
      // Restore previous state on error
      state = currentState;
      rethrow;
    }
  }

  Future<void> removeItem(String productId) async {
    final currentState = state;
    try {
      final updatedCart = await cartRepository.removeItem(productId);
      state = AsyncValue.data(updatedCart);
    } catch (err, stack) {
      state = currentState;
      rethrow;
    }
  }

  Future<void> updateQuantity(String productId, int quantity) async {
    final currentState = state;
    try {
      if (quantity <= 0) {
        await removeItem(productId);
      } else {
        final updatedCart = await cartRepository.updateQuantity(productId, quantity);
        state = AsyncValue.data(updatedCart);
      }
    } catch (err, stack) {
      state = currentState;
      rethrow;
    }
  }

  Future<void> clearCart() async {
    try {
      await cartRepository.clearCart();
      // Create an empty cart state
      state = const AsyncValue.data(Cart(
        id: '',
        userId: '',
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        paymentStatus: 'pending',
      ));
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }

  Future<void> checkout(String cartId, Map<String, dynamic> checkoutData) async {
    try {
      await cartRepository.checkout(cartId, checkoutData);
      // Clear cart after successful checkout
      await clearCart();
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
      rethrow;
    }
  }

  Future<void> refreshCart() async {
    try {
      final cart = await cartRepository.getCart();
      state = AsyncValue.data(cart);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }
}
