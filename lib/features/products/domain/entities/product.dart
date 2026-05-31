class Product {
  final String id;
  final String sellerId;
  final String name;
  final String description;
  final double price;
  final String category;
  final List<String> images;
  final bool verified;
  final DateTime createdAt;

  Product({
    required this.id,
    required this.sellerId,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.images,
    required this.verified,
    required this.createdAt,
  });
}
