import 'package:dio/dio.dart';
import 'package:bolt_marketplace/core/constants/api_endpoints.dart';
import '../../domain/entities/seller_dashboard.dart';

class SellerRemoteDataSource {
  final Dio dio;

  SellerRemoteDataSource(this.dio);

  Future<SellerDashboard> fetchDashboard() async {
    final response = await dio.get(ApiEndpoints.sellerDashboard);
    final data = response.data as Map<String, dynamic>;
    return SellerDashboard.fromJson(data);
  }
}
