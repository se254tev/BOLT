import '../../domain/entities/cart_item.dart';

class CartItemModel extends CartItem {
  const CartItemModel({
    required String productId,
    required String productName,
    required double price,
    required int quantity,
    String? productImage,
  }) : super(
    productId: productId,
    productName: productName,
    price: price,
    quantity: quantity,
    productImage: productImage,
  );

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    String loadedProductId = '';
    String loadedName = '';
    double loadedPrice = 0;
    String? loadedImage;

    final productData = json['productId'];
    if (productData is Map<String, dynamic>) {
      loadedProductId = productData['_id'] ?? productData['id'] ?? '';
      loadedName = productData['name'] ?? productData['title'] ?? json['productName'] ?? '';
      loadedPrice = (productData['price'] ?? json['price'] ?? 0).toDouble();
      final images = productData['images'];
      if (images is List<dynamic> && images.isNotEmpty) {
        loadedImage = images.first?.toString();
      }
    } else {
      loadedProductId = productData?.toString() ?? json['productId']?.toString() ?? '';
      loadedName = json['productName'] ?? json['name'] ?? '';
      loadedPrice = (json['price'] ?? 0).toDouble();
      loadedImage = json['productImage']?.toString();
    }

    return CartItemModel(
      productId: loadedProductId,
      productName: loadedName,
      price: loadedPrice,
      quantity: json['quantity'] ?? 1,
      productImage: loadedImage,
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'quantity': quantity,
    'price': price,
  };
}
