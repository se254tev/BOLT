import 'package:dio/dio.dart';
import 'package:bolt_marketplace/core/constants/api_endpoints.dart';
import '../models/property_model.dart';

class PropertyRemoteDataSource {
  final Dio dio;

  PropertyRemoteDataSource(this.dio);

  Future<List<PropertyModel>> fetchProperties({String? query}) async {
    final response = await dio.get(ApiEndpoints.properties, queryParameters: {'search': query});
    final data = response.data['properties'] as List<dynamic>;
    return data.map((item) => PropertyModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<PropertyModel> getPropertyById(String id) async {
    final response = await dio.get('${ApiEndpoints.properties}/$id');
    return PropertyModel.fromJson(response.data['property']);
  }

  Future<Map<String, dynamic>> requestBoost(String propertyId, {int durationDays = 7, int boostLevel = 1}) async {
    final response = await dio.post('${ApiEndpoints.properties}/$propertyId/boost', data: { 'durationDays': durationDays, 'boostLevel': boostLevel });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSubscriptionStatus() async {
    final response = await dio.get(ApiEndpoints.agentSubscription);
    return response.data as Map<String, dynamic>;
  }
}

