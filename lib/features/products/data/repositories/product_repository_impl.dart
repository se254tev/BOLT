import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_data_source.dart';
import '../models/product_model.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;

  ProductRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Product> addProduct(Product product) async {
    final payload = (product as ProductModel).toJson();
    return await remoteDataSource.createProduct(payload);
  }

  @override
  Future<void> deleteProduct(String id) async {
    await remoteDataSource.deleteProduct(id);
  }

  @override
  Future<List<Product>> fetchProducts({String? query}) async {
    return await remoteDataSource.fetchProducts(query: query);
  }

  @override
  Future<Product> getProductById(String id) async {
    return await remoteDataSource.getProductById(id);
  }

  @override
  Future<Product> updateProduct(Product product) async {
    final payload = (product as ProductModel).toJson();
    return await remoteDataSource.updateProduct(product.id, payload);
  }
}
