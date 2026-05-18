import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_drawer.dart';

class BitShell extends StatelessWidget {
  final Widget child;
  const BitShell({super.key, required this.child});

  static final _drawerItems = [
    DrawerItem(
        icon: Icons.dashboard_outlined,
        activeIcon: Icons.dashboard_rounded,
        label: 'Overview',
        path: '/bit'),
    DrawerItem(
        icon: Icons.map_outlined,
        activeIcon: Icons.map_rounded,
        label: 'Roadmaps',
        path: '/bit/roadmaps'),
    DrawerItem(
        icon: Icons.book_outlined,
        activeIcon: Icons.book_rounded,
        label: 'Courses',
        path: '/bit/courses'),
  ];

  static const _tabs = [
    _Tab(
        icon: Icons.dashboard_outlined,
        activeIcon: Icons.dashboard_rounded,
        label: 'Overview',
        path: '/bit'),
    _Tab(
        icon: Icons.map_outlined,
        activeIcon: Icons.map_rounded,
        label: 'Roadmaps',
        path: '/bit/roadmaps'),
    _Tab(
        icon: Icons.book_outlined,
        activeIcon: Icons.book_rounded,
        label: 'Courses',
        path: '/bit/courses'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (int i = _tabs.length - 1; i >= 0; i--) {
      if (location.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    final location = GoRouterState.of(context).matchedLocation;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      drawer: AppDrawer(
        items: _drawerItems,
        currentPath: location,
        accentColor: AppColors.bitSky,
      ),
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.slate900 : Colors.white,
          border: Border(
              top: BorderSide(
                  color: isDark ? AppColors.slate800 : AppColors.slate100)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final selected = i == idx;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => context.go(tab.path),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: selected
                                ? AppColors.bitSky.withOpacity(0.12)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Icon(selected ? tab.activeIcon : tab.icon,
                              color: selected
                                  ? AppColors.bitSky
                                  : AppColors.slate400,
                              size: 22),
                        ),
                        const SizedBox(height: 2),
                        Text(tab.label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight:
                                  selected ? FontWeight.w700 : FontWeight.w500,
                              color: selected
                                  ? AppColors.bitSky
                                  : AppColors.slate400,
                            )),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _Tab {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;
  const _Tab(
      {required this.icon,
      required this.activeIcon,
      required this.label,
      required this.path});
}
