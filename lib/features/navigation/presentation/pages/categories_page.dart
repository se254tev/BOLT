import 'package:flutter/material.dart';

class CategoriesPage extends StatelessWidget {
  const CategoriesPage({super.key});

  static const _categories = [
    'Electronics',
    'Fashion',
    'Home',
    'Beauty',
    'Sports',
    'Toys',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Categories')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Browse by category', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Expanded(
              child: GridView.builder(
                itemCount: _categories.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.2,
                ),
                itemBuilder: (context, index) {
                  final category = _categories[index];
                  return Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.label_outline, size: 28, color: Colors.blueGrey.shade700),
                          const Spacer(),
                          Text(category, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          const Text('Trending selection', style: TextStyle(color: Colors.black54)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
