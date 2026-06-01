import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/utils/validators.dart';
import '../../auth/presentation/controllers/auth_controller.dart';
import '../../../../shared/widgets/card_widget.dart';
import '../../../../shared/widgets/input_widget.dart';
import '../../../../shared/widgets/button_widget.dart';
import '../../../../shared/widgets/loading_widget.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  late bool _isSubmitting;

  @override
  void initState() {
    super.initState();
    _isSubmitting = false;
    ref.listen<AsyncValue<User?>>(authControllerProvider, (previous, next) {
      if (next is AsyncData<User?> && next.value != null) {
        context.go('/home');
      }
      if (next is AsyncLoading) {
        setState(() {
            appBar: AppBar(title: const Text(AppStrings.loginTitle)),
            body: Center(
              child: SizedBox(
                width: 480,
                child: AppCard(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AppInput(label: AppStrings.email, controller: _emailController),
                        const SizedBox(height: 12),
                        AppInput(label: AppStrings.password, controller: _passwordController, obscure: true),
                        const SizedBox(height: 20),
                        authState is AsyncLoading
                            ? const LoadingIndicator()
                            : AppButton(label: 'Login', onPressed: _isSubmitting ? null : _onLoginPressed),
                        if (authState is AsyncError) ...[
                          const SizedBox(height: 12),
                          Text(authState.error.toString(), style: const TextStyle(color: Colors.red)),
                        ],
                        const SizedBox(height: 12),
                        TextButton(onPressed: _isSubmitting ? null : () => context.go('/register'), child: const Text('Create an account')),
                      ],
                    ),
                  ),
                ),
              ),
            ),
                onPressed: _isSubmitting ? null : _onLoginPressed,
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Login'),
              ),
              if (authState is AsyncError) ...[
                const SizedBox(height: 12),
                Text(authState.error.toString(), style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 12),
              TextButton(
                onPressed: _isSubmitting ? null : () => context.go('/register'),
                child: const Text('Create an account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
