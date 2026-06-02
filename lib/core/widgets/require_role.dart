import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/features/auth/presentation/controllers/auth_controller.dart';

class RequireRole extends ConsumerWidget {
  final String requiredRole;
  final Widget child;
  final String fallbackRoute;

  const RequireRole({
    required this.requiredRole,
    required this.child,
    this.fallbackRoute = '/home',
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return authState.when(
      data: (user) {
        if (user == null) {
          Future.microtask(() => context.go('/login'));
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        if (user.role != requiredRole) {
          Future.microtask(() => context.go(fallbackRoute));
          return const Scaffold(body: Center(child: Text('Access denied')));
        }

        return child;
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (error, stack) => Scaffold(body: Center(child: Text('Error: $error'))),
    );
  }
}
