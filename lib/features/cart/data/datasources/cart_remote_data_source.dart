import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../models/cart_item_model.dart';
import '../models/cart_model.dart';

class CartRemoteDataSource {
  final Dio dio;

  CartRemoteDataSource(this.dio);

  Future<CartModel> getCart() async {
    try {
      final response = await dio.get(ApiEndpoints.cart);
      final cartData = response.data['cart'] ?? response.data;
      return CartModel.fromJson(cartData as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  double _calculateTotal(List<CartItemModel> items) {
    return items.fold<double>(0, (sum, item) => sum + item.subtotal);
  }

  Map<String, dynamic> _buildPayload(List<CartItemModel> items, {String paymentStatus = 'pending'}) {
    final subtotal = _calculateTotal(items);
    return {
      'items': items.map((item) => item.toJson()).toList(),
      'total': subtotal,
      'paymentStatus': paymentStatus,
    };
  }

  Future<CartModel> _saveCart({String? cartId, required List<CartItemModel> items, String paymentStatus = 'pending'}) async {
    try {
      final payload = _buildPayload(items, paymentStatus: paymentStatus);
      final response = cartId == null || cartId.isEmpty
          ? await dio.post(ApiEndpoints.cart, data: payload)
          : await dio.put('${ApiEndpoints.cart}/$cartId', data: payload);
      final cartData = response.data['cart'] ?? response.data;
      return CartModel.fromJson(cartData as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  Future<CartModel> addItem(CartModel? cart, CartItemModel item) async {
    final currentItems = cart?.items ?? [];
    final existingIndex = currentItems.indexWhere((entry) => entry.productId == item.productId);
    final List<CartItemModel> nextItems;

    if (existingIndex >= 0) {
      nextItems = List<CartItemModel>.from(currentItems);
      final existing = nextItems[existingIndex];
      nextItems[existingIndex] = CartItemModel(
        productId: existing.productId,
        productName: existing.productName,
        price: existing.price,
        quantity: existing.quantity + item.quantity,
        productImage: existing.productImage,
      );
    } else {
      nextItems = [...currentItems, item];
    }

    return _saveCart(cartId: cart?.id, items: nextItems, paymentStatus: cart?.paymentStatus ?? 'pending');
  }

  Future<CartModel> updateQuantity(CartModel cart, String productId, int quantity) async {
    final nextItems = cart.items
        .map((entry) => entry.productId == productId
            ? CartItemModel(
                productId: entry.productId,
                productName: entry.productName,
                price: entry.price,
                quantity: quantity,
                productImage: entry.productImage,
              )
            : entry)
        .where((entry) => entry.quantity > 0)
        .toList();

    return _saveCart(cartId: cart.id, items: nextItems, paymentStatus: cart.paymentStatus);
  }

  Future<CartModel> removeItem(CartModel cart, String productId) async {
    final nextItems = cart.items.where((entry) => entry.productId != productId).toList();
    return _saveCart(cartId: cart.id, items: nextItems, paymentStatus: cart.paymentStatus);
  }

  Future<void> clearCart(CartModel cart) async {
    if (cart.id.isEmpty) return;
    try {
      await dio.delete('${ApiEndpoints.cart}/${cart.id}');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> checkout(String cartId, Map<String, dynamic> checkoutData) async {
    try {
      final payload = Map<String, dynamic>.from(checkoutData);
      await dio.put('${ApiEndpoints.cart}/$cartId', data: payload);
    } catch (e) {
      rethrow;
    }
  }
}
