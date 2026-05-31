import '../entities/product.dart';
import '../repositories/product_repository.dart';

class FetchProductsUseCase {
  final ProductRepository repository;
  FetchProductsUseCase(this.repository);

  Future<List<Product>> call({String? query}) {
    return repository.fetchProducts(query: query);
  }
}

class GetProductDetailsUseCase {
  final ProductRepository repository;
  GetProductDetailsUseCase(this.repository);

  Future<Product> call(String id) {
    return repository.getProductById(id);
  }
}

class ManageProductUseCase {
  final ProductRepository repository;
  ManageProductUseCase(this.repository);

  Future<Product> create(Product product) => repository.addProduct(product);
  Future<Product> update(Product product) => repository.updateProduct(product);
  Future<void> delete(String id) => repository.deleteProduct(id);
}
