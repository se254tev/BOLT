import '../../domain/entities/product.dart';

class ProductModel extends Product {
  ProductModel({
    required super.id,
    required super.sellerId,
    required super.name,
    required super.description,
    required super.price,
    required super.category,
    required super.images,
    required super.verified,
    required super.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['_id'] ?? json['id'] ?? '',
      sellerId: json['sellerId'] ?? '',
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
