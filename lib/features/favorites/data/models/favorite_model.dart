class FavoriteModel {
  final String id;
  final String userId;
  final String itemId;
  final String itemType;

  FavoriteModel({required this.id, required this.userId, required this.itemId, required this.itemType});

  factory FavoriteModel.fromJson(Map<String, dynamic> json) {
    return FavoriteModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      itemId: json['itemId'] ?? '',
      itemType: json['itemType'] ?? 'product',
    );
  }
}
