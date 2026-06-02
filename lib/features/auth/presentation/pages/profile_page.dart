import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/features/auth/presentation/controllers/auth_controller.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return authState.when(
      data: (user) {
        return Scaffold(
          appBar: AppBar(title: const Text('Profile')),
          body: Padding(
            padding: const EdgeInsets.all(16.0),
            child: user == null
                ? const Center(child: Text('No user is currently logged in.'))
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Name: ${user.name}', style: const TextStyle(fontSize: 18)),
                      const SizedBox(height: 8),
                      Text('Email: ${user.email}', style: const TextStyle(fontSize: 18)),
                      const SizedBox(height: 8),
                      Text('Phone: ${user.phone}', style: const TextStyle(fontSize: 18)),
                      const SizedBox(height: 8),
                      Text('Role: ${user.role}', style: const TextStyle(fontSize: 18)),
                      const SizedBox(height: 24),
                      if (user.role == 'buyer') ...[
                        const Text('Want to sell on Bolt?'),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: () => context.go('/seller/onboarding/start'),
                          child: const Text('Become a Seller'),
                        ),
                      ] else if (user.role == 'seller') ...[
                        const Text('Manage your seller dashboard.'),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: () => context.go('/seller/dashboard'),
                          child: const Text('Go to Seller Dashboard'),
                        ),
                      ] else if (user.role == 'admin') ...[
                        const Text('Admin access is available on the web dashboard only.'),
                      ],
                    ],
                  ),
          ),
        );
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (error, stack) => Scaffold(body: Center(child: Text('Error: $error'))),
    );
  }
}
