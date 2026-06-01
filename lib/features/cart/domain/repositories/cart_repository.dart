import '../entities/cart.dart';

abstract class CartRepository {
  Future<Cart> getCart();
  Future<Cart> addItem(String productId, int quantity, {String? productName, double? price, String? image});
  Future<Cart> removeItem(String productId);
  Future<Cart> updateQuantity(String productId, int quantity);
  Future<void> clearCart();
  Future<void> checkout(String cartId, Map<String, dynamic> checkoutData);
}
