import '../entities/seller_dashboard.dart';

abstract class SellerRepository {
  Future<SellerDashboard> fetchDashboard();
}
