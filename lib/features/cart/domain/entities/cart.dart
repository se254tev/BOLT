import 'cart_item.dart';

class Cart {
  final String id;
  final String userId;
  final List<CartItem> items;
  final double subtotal;
  final double deliveryFee;
  final double total;
  final String paymentStatus;

  const Cart({
    required this.id,
    required this.userId,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.total,
    required this.paymentStatus,
  });

  int get itemCount => items.fold<int>(0, (sum, item) => sum + item.quantity);

  Cart copyWith({
    String? id,
    String? userId,
    List<CartItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? total,
    String? paymentStatus,
  }) {
    return Cart(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      total: total ?? this.total,
      paymentStatus: paymentStatus ?? this.paymentStatus,
    );
  }
}
