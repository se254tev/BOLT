import 'package:dio/dio.dart';
import 'package:bolt_marketplace/core/constants/api_endpoints.dart';
import '../models/product_model.dart';

class ProductRemoteDataSource {
  final Dio dio;

  ProductRemoteDataSource(this.dio);

  Future<List<ProductModel>> fetchProducts({String? query}) async {
    final response = await dio.get(ApiEndpoints.products, queryParameters: {'search': query});
    final data = response.data['products'] as List<dynamic>;
    return data.map((item) => ProductModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<ProductModel> getProductById(String id) async {
    final response = await dio.get('${ApiEndpoints.products}/$id');
    return ProductModel.fromJson(response.data['product']);
  }

  Future<ProductModel> createProduct(Map<String, dynamic> payload) async {
    final response = await dio.post(ApiEndpoints.products, data: payload);
    return ProductModel.fromJson(response.data['product']);
  }

  Future<ProductModel> updateProduct(String id, Map<String, dynamic> payload) async {
    final response = await dio.put('${ApiEndpoints.products}/$id', data: payload);
    return ProductModel.fromJson(response.data['product']);
  }

  Future<void> deleteProduct(String id) async {
    await dio.delete('${ApiEndpoints.products}/$id');
  }
}
