import '../../domain/entities/property.dart';

class PropertyModel extends Property {
  PropertyModel({
    required super.id,
    required super.sellerId,
    required super.title,
    required super.description,
    required super.location,
    required super.price,
    required super.bedrooms,
    required super.bathrooms,
    required super.images,
    required super.verified,
    required super.createdAt,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['_id'] ?? json['id'] ?? '',
      sellerId: json['sellerId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      bedrooms: json['bedrooms'] ?? 0,
      bathrooms: json['bathrooms'] ?? 0,
      images: List<String>.from(json['images'] ?? []),
      verified: json['verified'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}
