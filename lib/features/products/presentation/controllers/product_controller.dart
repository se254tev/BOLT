import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart';
import 'package:bolt_marketplace/core/providers.dart';
import 'package:bolt_marketplace/features/products/domain/entities/product.dart';
import 'package:bolt_marketplace/features/products/domain/usecases/product_usecases.dart';

final productControllerProvider = StateNotifierProvider<ProductController, AsyncValue<List<Product>>>(
  (ref) => ProductController(ref),
);

class ProductController extends StateNotifier<AsyncValue<List<Product>>> {
  final Ref ref;
  ProductController(this.ref) : super(const AsyncValue.loading()) {
    loadProducts();
  }

  Future<void> loadProducts({String? query}) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(productRepositoryProvider);
      final products = await FetchProductsUseCase(repository)(query: query);
      state = AsyncValue.data(products);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

