import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'network/dio_client.dart';
import 'services/storage_service.dart';
import '../features/auth/data/datasources/auth_remote_data_source.dart';
import '../features/auth/data/repositories/auth_repository_impl.dart';
import '../features/auth/domain/repositories/auth_repository.dart';
import '../features/products/data/datasources/product_remote_data_source.dart';
import '../features/products/data/repositories/product_repository_impl.dart';
import '../features/products/domain/repositories/product_repository.dart';
import '../features/cart/data/datasources/cart_remote_data_source.dart';
import '../features/cart/data/repositories/cart_repository_impl.dart';
import '../features/cart/domain/entities/cart.dart';
import '../features/cart/domain/repositories/cart_repository.dart';
import '../features/cart/presentation/controllers/cart_controller.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());
final storageServiceProvider = Provider<StorageService>((ref) => StorageService());
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) => AuthRemoteDataSource(ref.read(dioClientProvider).dio));
final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepositoryImpl(remoteDataSource: ref.read(authRemoteDataSourceProvider), storageService: ref.read(storageServiceProvider)));
final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) => ProductRemoteDataSource(ref.read(dioClientProvider).dio));
final productRepositoryProvider = Provider<ProductRepository>((ref) => ProductRepositoryImpl(remoteDataSource: ref.read(productRemoteDataSourceProvider)));
final cartRemoteDataSourceProvider = Provider<CartRemoteDataSource>((ref) => CartRemoteDataSource(ref.read(dioClientProvider).dio));
final cartRepositoryProvider = Provider<CartRepository>((ref) => CartRepositoryImpl(remoteDataSource: ref.read(cartRemoteDataSourceProvider)));
final cartControllerProvider = StateNotifierProvider<CartController, AsyncValue<Cart>>(
  (ref) => CartController(cartRepository: ref.read(cartRepositoryProvider)),
);
