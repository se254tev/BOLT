import '../../../../core/services/storage_service.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final StorageService storageService;

  AuthRepositoryImpl({required this.remoteDataSource, required this.storageService});

  @override
  Future<User> login({required String email, required String password}) async {
    final resp = await remoteDataSource.login(email, password);
    final user = resp['user'];
    final access = resp['accessToken'];
    if (access != null) await storageService.write('jwt_token', access);
    return user;
  }

  @override
  Future<User> register({required String name, required String email, required String password, required String phone, required String role}) async {
    final resp = await remoteDataSource.register(name, email, password, phone, role);
    final user = resp['user'];
    final access = resp['accessToken'];
    if (access != null) await storageService.write('jwt_token', access);
    return user;
  }

  @override
  Future<User?> getProfile() async {
    return null;
  }

  @override
  Future<void> logout() async {
    await remoteDataSource.logout();
    await storageService.delete('jwt_token');
  }
}
