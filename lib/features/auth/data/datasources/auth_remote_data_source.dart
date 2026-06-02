import 'package:dio/dio.dart';
import 'package:bolt_marketplace/core/constants/api_endpoints.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSource(this.dio);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await dio.post('${ApiEndpoints.auth}/login', data: {
      'email': email,
      'password': password,
    });
    return {
      'user': UserModel.fromJson(response.data['data']['user']),
      'accessToken': response.data['data']['accessToken'],
    };
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, String phone, String role) async {
    final response = await dio.post('${ApiEndpoints.auth}/register', data: {
      'name': name,
      'email': email,
      'password': password,
      'phone': phone,
      'role': role,
    });
    return {
      'user': UserModel.fromJson(response.data['data']['user']),
      'accessToken': response.data['data']['accessToken'],
    };
  }

  Future<void> logout() async {
    await dio.post('${ApiEndpoints.auth}/logout');
  }

  Future<Map<String, dynamic>?> getProfile() async {
    try {
      final response = await dio.get('${ApiEndpoints.auth}/me');
      return {
        'user': UserModel.fromJson(response.data['data']['user']),
      };
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>> applySeller() async {
    final response = await dio.post('/seller/apply');
    return response.data['data'] ?? {};
  }

  Future<Map<String, dynamic>> activateSeller() async {
    final response = await dio.patch('/seller/activate');
    return response.data['data'] ?? {};
  }
}
