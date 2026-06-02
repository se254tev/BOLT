import 'package:dio/dio.dart';
import 'package:bolt_marketplace/core/constants/api_endpoints.dart';

class FoodRemoteDataSource {
  final Dio dio;

  FoodRemoteDataSource(this.dio);

  Future<List<Map<String, dynamic>>> fetchRestaurants({String? search, bool? verified}) async {
    final response = await dio.get(ApiEndpoints.restaurants, queryParameters: {
      if (search != null) 'search': search,
      if (verified != null) 'verified': verified.toString(),
    });
    return List<Map<String, dynamic>>.from(response.data['restaurants'] as List<dynamic>);
  }

  Future<Map<String, dynamic>> getRestaurant(String id) async {
    final response = await dio.get('${ApiEndpoints.restaurants}/$id');
    return Map<String, dynamic>.from(response.data['restaurant'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> createRestaurant(Map<String, dynamic> payload) async {
    final response = await dio.post(ApiEndpoints.restaurants, data: payload);
    return Map<String, dynamic>.from(response.data['restaurant'] as Map<String, dynamic>);
  }

  Future<List<Map<String, dynamic>>> fetchMeals({String? category, String? restaurantId, String? search, String? sortBy}) async {
    final response = await dio.get(ApiEndpoints.meals, queryParameters: {
      if (category != null) 'category': category,
      if (restaurantId != null) 'restaurantId': restaurantId,
      if (search != null) 'search': search,
      if (sortBy != null) 'sortBy': sortBy,
    });
    return List<Map<String, dynamic>>.from(response.data['meals'] as List<dynamic>);
  }

  Future<Map<String, dynamic>> getMeal(String id) async {
    final response = await dio.get('${ApiEndpoints.meals}/$id');
    return Map<String, dynamic>.from(response.data['meal'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> createMeal(Map<String, dynamic> payload) async {
    final response = await dio.post(ApiEndpoints.meals, data: payload);
    return Map<String, dynamic>.from(response.data['meal'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> placeOrder(Map<String, dynamic> payload) async {
    final response = await dio.post(ApiEndpoints.foodOrders, data: payload);
    return Map<String, dynamic>.from(response.data['order'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> getOrder(String id) async {
    final response = await dio.get('${ApiEndpoints.foodOrders}/$id');
    return Map<String, dynamic>.from(response.data['order'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> updateOrderStatus(String id, String status) async {
    final response = await dio.patch('${ApiEndpoints.foodOrders}/$id/status', data: {'status': status});
    return Map<String, dynamic>.from(response.data['order'] as Map<String, dynamic>);
  }
}
