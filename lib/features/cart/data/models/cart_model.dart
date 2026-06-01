import 'cart_item_model.dart';
import '../../domain/entities/cart.dart';

class CartModel extends Cart {
  const CartModel({
    required String id,
    required String userId,
    required List<CartItemModel> items,
    required double subtotal,
    required double deliveryFee,
    required double total,
    required String paymentStatus,
  }) : super(
    id: id,
    userId: userId,
    items: items,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    paymentStatus: paymentStatus,
  );

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>?)
        ?.map((item) => CartItemModel.fromJson(item as Map<String, dynamic>))
        .toList() ?? [];

    final subtotal = (json['subtotal'] ?? itemsList.fold<double>(0, (sum, item) => sum + item.subtotal)).toDouble();
    final deliveryFee = (json['deliveryFee'] ?? 5.0).toDouble();
    final total = (json['total'] ?? subtotal + deliveryFee).toDouble();
    final paymentStatus = json['paymentStatus'] ?? 'pending';
    final userIdData = json['userId'];
    final userId = userIdData is Map<String, dynamic> ? userIdData['_id'] ?? '' : (userIdData?.toString() ?? '');

    return CartModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: userId,
      items: itemsList,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      paymentStatus: paymentStatus,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'userId': userId,
    'items': (items as List<CartItemModel>).map((item) => item.toJson()).toList(),
    'subtotal': subtotal,
    'deliveryFee': deliveryFee,
    'total': total,
    'paymentStatus': paymentStatus,
  };
}
