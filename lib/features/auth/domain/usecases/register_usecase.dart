import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;
  RegisterUseCase(this.repository);

  Future<User> call({required String name, required String email, required String password, required String phone, required String role}) {
    return repository.register(name: name, email: email, password: password, phone: phone, role: role);
  }
}
