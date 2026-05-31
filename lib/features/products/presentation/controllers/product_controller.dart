import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../domain/entities/product.dart';
import '../../domain/usecases/product_usecases.dart';

final productControllerProvider = StateNotifierProvider<ProductController, AsyncValue<List<Product>>>(
  (ref) => ProductController(ref.read),
);

class ProductController extends StateNotifier<AsyncValue<List<Product>>> {
  final Reader read;
  ProductController(this.read) : super(const AsyncValue.loading()) {
    loadProducts();
  }

  Future<void> loadProducts({String? query}) async {
    state = const AsyncValue.loading();
    try {
      final repository = read(productRepositoryProvider);
      final products = await FetchProductsUseCase(repository)(query: query);
      state = AsyncValue.data(products);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

