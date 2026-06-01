import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';

final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<User?>>(
  (ref) => AuthController(ref.read),
);

class AuthController extends StateNotifier<AsyncValue<User?>> {
  final Reader read;
  AuthController(this.read) : super(const AsyncValue.data(null));

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final repository = read(authRepositoryProvider);
      final user = await LoginUseCase(repository)(email: email, password: password);
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> register(String name, String email, String password, String phone, String role) async {
    state = const AsyncValue.loading();
    try {
      final repository = read(authRepositoryProvider);
      final user = await RegisterUseCase(repository)(name: name, email: email, password: password, phone: phone, role: role);
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

