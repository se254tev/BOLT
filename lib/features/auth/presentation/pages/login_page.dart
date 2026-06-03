import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/constants/app_strings.dart';
import 'package:bolt_marketplace/features/auth/domain/entities/user.dart';
import 'package:bolt_marketplace/core/navigation/app_router_controller.dart';
import 'package:bolt_marketplace/features/auth/presentation/controllers/auth_controller.dart';
import 'package:bolt_marketplace/core/utils/validators.dart';
import 'package:bolt_marketplace/shared/widgets/card_widget.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import 'package:bolt_marketplace/shared/widgets/loading_widget.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    ref.listen<AsyncValue<User?>>(authControllerProvider, (previous, next) {
      if (next is AsyncData<User?> && next.value != null) {
        if (mounted) AppRouterController.instance.navigate(context, next.value!);
      }
    });
  }

  Future<void> _onLoginPressed() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    try {
      await ref.read(authControllerProvider.notifier).login(_emailController.text.trim(), _passwordController.text);
    } catch (_) {}
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.loginTitle)),
      body: Center(
        child: SizedBox(
          width: 480,
          child: AppCard(
            child: Form(
              key: _formKey,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: AppStrings.email),
                      validator: validateEmail,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: AppStrings.password),
                      validator: validatePassword,
                    ),
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
      ),
    );
  }
}
