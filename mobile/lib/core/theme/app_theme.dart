import 'package:flutter/material.dart';

class AppColors {
  // Brand colors matching the web app
  static const navy = Color(0xFF02436D);
  static const teal = Color(0xFF0D9488);
  static const tealLight = Color(0xFF14B8A6);

  // Portal identity colors
  static const studentBlue = Color(0xFF2563EB);
  static const teacherTeal = Color(0xFF0D9488);
  static const adminIndigo = Color(0xFF4F46E5);
  static const bitSky = Color(0xFF0284C7);

  // Neutral
  static const slate50 = Color(0xFFF8FAFC);
  static const slate100 = Color(0xFFF1F5F9);
  static const slate200 = Color(0xFFE2E8F0);
  static const slate300 = Color(0xFFCBD5E1);
  static const slate400 = Color(0xFF94A3B8);
  static const slate500 = Color(0xFF64748B);
  static const slate600 = Color(0xFF475569);
  static const slate700 = Color(0xFF334155);
  static const slate800 = Color(0xFF1E293B);
  static const slate900 = Color(0xFF0F172A);
  static const slate950 = Color(0xFF020617);

  // Semantic
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.teal,
          brightness: Brightness.light,
          primary: AppColors.navy,
          secondary: AppColors.teal,
          surface: AppColors.slate50,
          error: AppColors.error,
        ),
        fontFamily: 'Roboto',
        scaffoldBackgroundColor: AppColors.slate50,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.navy,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.navy,
          ),
          iconTheme: IconThemeData(color: AppColors.navy),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.slate100),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.navy,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.navy,
            side: const BorderSide(color: AppColors.slate200),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.slate50,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.slate200),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.slate200),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.teal, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          hintStyle: const TextStyle(
            color: AppColors.slate400,
            fontWeight: FontWeight.w500,
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.teal,
          unselectedItemColor: AppColors.slate400,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.slate100,
          thickness: 1,
        ),
        textTheme: _buildTextTheme(Brightness.light),
      );

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.teal,
          brightness: Brightness.dark,
          primary: AppColors.teal,
          secondary: AppColors.tealLight,
          surface: AppColors.slate950,
          error: AppColors.error,
        ),
        fontFamily: 'Roboto',
        scaffoldBackgroundColor: AppColors.slate950,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.slate900,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
          iconTheme: IconThemeData(color: Colors.white),
        ),
        cardTheme: CardThemeData(
          color: AppColors.slate900,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.slate800),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.teal,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.slate800,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.slate700),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.slate700),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.teal, width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          hintStyle: const TextStyle(color: AppColors.slate500),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.slate900,
          selectedItemColor: AppColors.teal,
          unselectedItemColor: AppColors.slate500,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.slate800,
          thickness: 1,
        ),
        textTheme: _buildTextTheme(Brightness.dark),
      );

  static TextTheme _buildTextTheme(Brightness brightness) {
    final color =
        brightness == Brightness.light ? AppColors.slate900 : Colors.white;
    final subtleColor = brightness == Brightness.light
        ? AppColors.slate500
        : AppColors.slate400;

    return TextTheme(
      displayLarge:
          TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: color),
      displayMedium:
          TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color),
      displaySmall:
          TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: color),
      headlineLarge:
          TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: color),
      headlineMedium:
          TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: color),
      headlineSmall:
          TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: color),
      titleLarge:
          TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color),
      titleMedium:
          TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: color),
      titleSmall:
          TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color),
      bodyLarge:
          TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: color),
      bodyMedium: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w400, color: subtleColor),
      bodySmall: TextStyle(
          fontSize: 12, fontWeight: FontWeight.w400, color: subtleColor),
      labelLarge: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: color,
          letterSpacing: 0.5),
      labelSmall: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: subtleColor,
          letterSpacing: 1.0),
    );
  }
}
