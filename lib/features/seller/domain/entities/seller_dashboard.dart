class SellerDashboard {
  final int totalProducts;
  final int totalProperties;
  final int pendingListings;
  final int verifiedListings;
  final int totalReviews;
  final int totalOrders;
  final double revenue;

  const SellerDashboard({
    required this.totalProducts,
    required this.totalProperties,
    required this.pendingListings,
    required this.verifiedListings,
    required this.totalReviews,
    required this.totalOrders,
    required this.revenue,
  });

  factory SellerDashboard.fromJson(Map<String, dynamic> json) {
    final revenueValue = json['revenue'];
    return SellerDashboard(
      totalProducts: json['totalProducts'] is int ? json['totalProducts'] as int : int.tryParse('${json['totalProducts']}') ?? 0,
      totalProperties: json['totalProperties'] is int ? json['totalProperties'] as int : int.tryParse('${json['totalProperties']}') ?? 0,
      pendingListings: json['pendingListings'] is int ? json['pendingListings'] as int : int.tryParse('${json['pendingListings']}') ?? 0,
      verifiedListings: json['verifiedListings'] is int ? json['verifiedListings'] as int : int.tryParse('${json['verifiedListings']}') ?? 0,
      totalReviews: json['totalReviews'] is int ? json['totalReviews'] as int : int.tryParse('${json['totalReviews']}') ?? 0,
      totalOrders: json['totalOrders'] is int ? json['totalOrders'] as int : int.tryParse('${json['totalOrders']}') ?? 0,
      revenue: revenueValue is num ? revenueValue.toDouble() : double.tryParse('$revenueValue') ?? 0.0,
    );
  }
}
