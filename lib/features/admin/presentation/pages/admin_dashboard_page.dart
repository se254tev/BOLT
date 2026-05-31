import 'package:flutter/material.dart';

class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Admin tools for verification, moderation, and analytics', style: TextStyle(fontSize: 18)),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: () {}, child: const Text('Verify Products')),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: () {}, child: const Text('Verify Properties')),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: () {}, child: const Text('Manage Users')),
          ],
        ),
      ),
    );
  }
}
