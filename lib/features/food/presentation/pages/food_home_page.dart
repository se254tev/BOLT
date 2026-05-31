import 'package:flutter/material.dart';

class FoodHomePage extends StatelessWidget {
  const FoodHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 6,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Food Marketplace'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Breakfast'),
              Tab(text: 'Lunch'),
              Tab(text: 'Supper'),
              Tab(text: 'Dinner'),
              Tab(text: 'Snacks'),
              Tab(text: 'Drinks'),
            ],
          ),
        ),
        body: TabBarView(
          children: List.generate(
            6,
            (index) => const Center(child: Text('Meal list will appear here.')),
          ),
        ),
      ),
    );
  }
}
