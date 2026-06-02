class CartItem {
  final String productId;
  final String productName;
  final double price;
  final int quantity;
  final String? productImage;

  const CartItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    this.productImage,
  });

  double get subtotal => price * quantity;

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'productName': productName,
        'price': price,
        'quantity': quantity,
        if (productImage != null) 'productImage': productImage,
      };
}
