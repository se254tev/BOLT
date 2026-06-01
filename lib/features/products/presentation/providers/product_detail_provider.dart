import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../domain/entities/product.dart';

final productDetailProvider = FutureProvider.family<Product, String>((ref, productId) {
  final repository = ref.read(productRepositoryProvider);
  return repository.getProductById(productId);
});
