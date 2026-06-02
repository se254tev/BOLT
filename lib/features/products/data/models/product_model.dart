import '../../domain/entities/product.dart';

class ProductModel extends Product {
  ProductModel({
    required super.id,
    required super.sellerId,
    super.sellerName,
    required super.name,
    required super.description,
    required super.price,
    required super.category,
    required super.images,
    required super.verified,
    required super.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final sellerData = json['sellerId'];
    String sellerId;
    String? sellerName;

    if (sellerData is String) {
      sellerId = sellerData;
    } else if (sellerData is Map) {
      sellerId = sellerData['_id'] ?? sellerData['id'] ?? '';
      sellerName = sellerData['name'] as String?;
    } else {
      sellerId = '';
    }

    return ProductModel(
      id: json['_id'] ?? json['id'] ?? '',
      sellerId: sellerId,
      sellerName: sellerName ?? json['sellerName'] as String?,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      category: json['category'] ?? 'General',
      images: List<String>.from(json['images'] ?? []),
      verified: json['verified'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sellerId': sellerId,
      'sellerName': sellerName,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'images': images,
      'verified': verified,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
