import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'network/dio_client.dart';
import 'services/storage_service.dart';
import '../features/auth/data/datasources/auth_remote_data_source.dart';
import '../features/auth/data/repositories/auth_repository_impl.dart';
import '../features/auth/domain/repositories/auth_repository.dart';
import '../features/products/data/datasources/product_remote_data_source.dart';
import '../features/products/data/repositories/product_repository_impl.dart';
import '../features/products/domain/repositories/product_repository.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());
final storageServiceProvider = Provider<StorageService>((ref) => StorageService());
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) => AuthRemoteDataSource(ref.read(dioClientProvider).dio));
final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepositoryImpl(remoteDataSource: ref.read(authRemoteDataSourceProvider), storageService: ref.read(storageServiceProvider)));
final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) => ProductRemoteDataSource(ref.read(dioClientProvider).dio));
final productRepositoryProvider = Provider<ProductRepository>((ref) => ProductRepositoryImpl(remoteDataSource: ref.read(productRemoteDataSourceProvider)));
