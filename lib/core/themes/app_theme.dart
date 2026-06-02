import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFFF7F7F8); // gray-50
  static const Color card = Colors.white;
  static const Color primary = Colors.black;
  static const Color muted = Color(0xFF6B7280);
}

class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 40.0;
}

class AppTextStyles {
  static const TextStyle h1 = TextStyle(fontSize: 28, fontWeight: FontWeight.w700);
  static const TextStyle h2 = TextStyle(fontSize: 20, fontWeight: FontWeight.w600);
  static const TextStyle body = TextStyle(fontSize: 14, fontWeight: FontWeight.w400);
  static const TextStyle caption = TextStyle(fontSize: 12, color: Colors.grey);
}

class AppTheme {
  static final ThemeData light = ThemeData(
    scaffoldBackgroundColor: AppColors.background,
    primaryColor: AppColors.primary,
    colorScheme: ColorScheme.light(primary: AppColors.primary),
    useMaterial3: true,
    textTheme: const TextTheme(
      displayLarge: AppTextStyles.h1,
      titleLarge: AppTextStyles.h2,
      bodyLarge: AppTextStyles.body,
      bodySmall: AppTextStyles.caption,
    ),
    appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0, backgroundColor: Colors.transparent, foregroundColor: Colors.black),
    cardTheme: const CardThemeData(color: AppColors.card, elevation: 2, shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12)))),
  );

  static final ThemeData dark = ThemeData(
    scaffoldBackgroundColor: Colors.black,
    primaryColor: Colors.white,
    colorScheme: ColorScheme.dark(primary: Colors.white),
    useMaterial3: true,
    textTheme: const TextTheme(
      displayLarge: AppTextStyles.h1,
      titleLarge: AppTextStyles.h2,
      bodyLarge: AppTextStyles.body,
      bodySmall: AppTextStyles.caption,
    ),
    appBarTheme: const AppBarTheme(centerTitle: true),
    cardTheme: const CardThemeData(elevation: 2, shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12)))),
  );
}
