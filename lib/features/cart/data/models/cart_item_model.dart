class CartItemModel {
  final String id;
  final String productId;
  final String userId;
  final int quantity;

  CartItemModel({required this.id, required this.productId, required this.userId, required this.quantity});

  Map<String, dynamic> toJson() {
    return {'productId': productId, 'userId': userId, 'quantity': quantity};
  }

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: json['_id'] ?? json['id'] ?? '',
      productId: json['productId'] ?? '',
      userId: json['userId'] ?? '',
      quantity: json['quantity'] ?? 1,
    );
  }
}
