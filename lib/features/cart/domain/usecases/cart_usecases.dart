import '../entities/cart.dart';
import '../repositories/cart_repository.dart';

class FetchCartUseCase {
  final CartRepository repository;
  FetchCartUseCase(this.repository);

  Future<Cart> call() => repository.getCart();
}

class AddCartItemUseCase {
  final CartRepository repository;
  AddCartItemUseCase(this.repository);

  Future<Cart> call(String productId, int quantity, {String? productName, double? price, String? image}) {
    return repository.addItem(productId, quantity, productName: productName, price: price, image: image);
  }
}

class RemoveCartItemUseCase {
  final CartRepository repository;
  RemoveCartItemUseCase(this.repository);

  Future<Cart> call(String productId) => repository.removeItem(productId);
}

class UpdateCartItemQuantityUseCase {
  final CartRepository repository;
  UpdateCartItemQuantityUseCase(this.repository);

  Future<Cart> call(String productId, int quantity) => repository.updateQuantity(productId, quantity);
}

class ClearCartUseCase {
  final CartRepository repository;
  ClearCartUseCase(this.repository);

  Future<void> call() => repository.clearCart();
}

class CheckoutUseCase {
  final CartRepository repository;
  CheckoutUseCase(this.repository);

  Future<void> call(String cartId, Map<String, dynamic> checkoutData) => repository.checkout(cartId, checkoutData);
}
