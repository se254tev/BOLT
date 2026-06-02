import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/providers.dart';
import 'package:bolt_marketplace/features/products/domain/entities/product.dart';

final productDetailProvider = FutureProvider.family<Product, String>((ref, productId) {
  final repository = ref.read(productRepositoryProvider);
  return repository.getProductById(productId);
});
