import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/providers/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const ProviderScope(child: CareerGuideApp()));
}

class CareerGuideApp extends ConsumerStatefulWidget {
  const CareerGuideApp({super.key});

  @override
  ConsumerState<CareerGuideApp> createState() => _CareerGuideAppState();
}

class _CareerGuideAppState extends ConsumerState<CareerGuideApp> {
  // Router is created once and never recreated — critical for stable navigation
  late final _router = ref.read(appRouterProvider);

  @override
  Widget build(BuildContext context) {
    // Only theme is watched — it doesn't affect the router
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'BiT CareerGuide',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: _router,
    );
  }
}
