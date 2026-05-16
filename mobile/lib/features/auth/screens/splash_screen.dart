import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.teal,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(Icons.school_rounded,
                  color: Colors.white, size: 44),
            ),
            const SizedBox(height: 24),
            RichText(
              text: const TextSpan(
                style: TextStyle(
                  
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
                children: [
                  TextSpan(text: 'Career'),
                  TextSpan(
                    text: 'Guide',
                    style: TextStyle(color: AppColors.teal),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'BiT Student Portal',
              style: TextStyle(
                
                color: Colors.white54,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 48),
            const SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                color: AppColors.teal,
                strokeWidth: 3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
