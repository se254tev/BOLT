class Property {
  final String id;
  final String sellerId;
  final String title;
  final String description;
  final String location;
  final double price;
  final int bedrooms;
  final int bathrooms;
  final List<String> images;
  final bool verified;
  final DateTime createdAt;

  Property({
    required this.id,
    required this.sellerId,
    required this.title,
    required this.description,
    required this.location,
    required this.price,
    required this.bedrooms,
    required this.bathrooms,
    required this.images,
    required this.verified,
    required this.createdAt,
  });
}
