import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/constants/app_strings.dart';
import 'package:bolt_marketplace/core/navigation/app_router_controller.dart';
import 'package:bolt_marketplace/core/utils/validators.dart';
import 'package:bolt_marketplace/features/auth/domain/entities/user.dart';
import 'package:bolt_marketplace/features/auth/presentation/controllers/auth_controller.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'buyer';

  @override
  void initState() {
    super.initState();
    ref.listen<AsyncValue<User?>>(authControllerProvider, (previous, next) {
      if (next is AsyncData<User?> && next.value != null) {
        if (mounted) AppRouterController.instance.navigate(context, next.value!);
      }
    });
  }

  void _onRegister() {
    if (!_formKey.currentState!.validate()) return;
    ref.read(authControllerProvider.notifier).register(
          _nameController.text.trim(),
          _emailController.text.trim(),
          _passwordController.text,
          _phoneController.text.trim(),
          _selectedRole,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.registerTitle)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: AppStrings.name),
                validator: (value) => value == null || value.isEmpty ? 'Enter your full name' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: AppStrings.email),
                validator: (value) => value == null || !Validators.isValidEmail(value) ? 'Enter a valid email' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: AppStrings.phone),
                validator: (value) => value == null || value.length < 8 ? 'Enter a phone number' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedRole,
                decoration: const InputDecoration(labelText: 'Account type'),
                items: const [
                  DropdownMenuItem(value: 'buyer', child: Text('Buyer')),
                  DropdownMenuItem(value: 'seller', child: Text('Seller')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedRole = value);
                  }
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: AppStrings.password),
                validator: (value) => value == null || !Validators.isValidPassword(value) ? 'Password must be 8+ chars' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _onRegister, child: const Text('Register')),
            ],
          ),
        ),
      ),
    );
  }
}
