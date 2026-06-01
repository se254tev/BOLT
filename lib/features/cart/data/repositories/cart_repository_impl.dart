import '../datasources/cart_remote_data_source.dart';
import '../models/cart_item_model.dart';
import '../models/cart_model.dart';
import '../../domain/entities/cart.dart';
import '../../domain/repositories/cart_repository.dart';

class CartRepositoryImpl implements CartRepository {
  final CartRemoteDataSource remoteDataSource;

  CartRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Cart> getCart() async {
    return await remoteDataSource.getCart();
  }

  @override
  Future<Cart> addItem(String productId, int quantity, {String? productName, double? price, String? image}) async {
    final currentCart = await remoteDataSource.getCart();
    final item = CartItemModel(
      productId: productId,
      productName: productName ?? currentCart.items.firstWhere((it) => it.productId == productId, orElse: () => CartItemModel(productId: productId, productName: productName ?? 'Item', price: price ?? 0, quantity: quantity, productImage: image)).productName,
      price: price ?? currentCart.items.firstWhere((it) => it.productId == productId, orElse: () => CartItemModel(productId: productId, productName: productName ?? 'Item', price: 0, quantity: quantity, productImage: image)).price,
      quantity: quantity,
      productImage: image,
    );
    return await remoteDataSource.addItem(currentCart, item);
  }

  @override
  Future<Cart> removeItem(String productId) async {
    final currentCart = await remoteDataSource.getCart();
    return await remoteDataSource.removeItem(currentCart, productId);
  }

  @override
  Future<Cart> updateQuantity(String productId, int quantity) async {
    final currentCart = await remoteDataSource.getCart();
    return await remoteDataSource.updateQuantity(currentCart, productId, quantity);
  }

  @override
  Future<void> clearCart() async {
    final currentCart = await remoteDataSource.getCart();
    await remoteDataSource.clearCart(currentCart);
  }

  @override
  Future<void> checkout(String cartId, Map<String, dynamic> checkoutData) async {
    await remoteDataSource.checkout(cartId, checkoutData);
  }
}
