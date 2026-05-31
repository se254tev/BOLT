import 'package:flutter/material.dart';

class AppTheme {
  static final ThemeData light = ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
    useMaterial3: true,
    brightness: Brightness.light,
    appBarTheme: const AppBarTheme(centerTitle: true),
  );

  static final ThemeData dark = ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple, brightness: Brightness.dark),
    useMaterial3: true,
    brightness: Brightness.dark,
    appBarTheme: const AppBarTheme(centerTitle: true),
  );
}
