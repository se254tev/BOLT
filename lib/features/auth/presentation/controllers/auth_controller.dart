import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart';
import 'package:bolt_marketplace/core/providers.dart';
import 'package:bolt_marketplace/features/auth/domain/entities/user.dart';
import 'package:bolt_marketplace/features/auth/domain/usecases/login_usecase.dart';
import 'package:bolt_marketplace/features/auth/domain/usecases/register_usecase.dart';

final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<User?>>(
  (ref) => AuthController(ref),
);

class AuthController extends StateNotifier<AsyncValue<User?>> {
  final Ref ref;
  AuthController(this.ref) : super(const AsyncValue.data(null));

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await LoginUseCase(repository)(email: email, password: password);
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> register(String name, String email, String password, String phone, String role) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await RegisterUseCase(repository)(name: name, email: email, password: password, phone: phone, role: role);
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> refreshProfile() async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.getProfile();
      state = AsyncValue.data(user);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> applySeller() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.applySeller();
      await refreshProfile();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> activateSeller() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.activateSeller();
      await refreshProfile();
    } catch (e) {
      rethrow;
    }
  }
}

