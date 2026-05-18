import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_drawer.dart';

class StudentShell extends StatelessWidget {
  final Widget child;
  const StudentShell({super.key, required this.child});

  // GlobalKey ensures the drawer Scaffold is always findable
  static final _scaffoldKey = GlobalKey<ScaffoldState>();

  // Public accessor for AppHeader
  static GlobalKey<ScaffoldState> get scaffoldKey => _scaffoldKey;

  static final _drawerItems = [
    DrawerItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home_rounded,
        label: 'Home',
        path: '/student'),
    DrawerItem(
        icon: Icons.map_outlined,
        activeIcon: Icons.map_rounded,
        label: 'Roadmaps',
        path: '/student/roadmaps'),
    DrawerItem(
        icon: Icons.book_outlined,
        activeIcon: Icons.book_rounded,
        label: 'Courses',
        path: '/student/courses'),
    DrawerItem(
        icon: Icons.work_outline_rounded,
        activeIcon: Icons.work_rounded,
        label: 'Careers',
        path: '/student/careers'),
    DrawerItem(
        icon: Icons.quiz_outlined,
        activeIcon: Icons.quiz_rounded,
        label: 'Assessments',
        path: '/student/assessments'),
    DrawerItem(
        icon: Icons.person_outline,
        activeIcon: Icons.person_rounded,
        label: 'Profile',
        path: '/student/profile'),
  ];

  static const _navItems = [
    _NavItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home_rounded,
        label: 'Home',
        path: '/student'),
    _NavItem(
        icon: Icons.map_outlined,
        activeIcon: Icons.map_rounded,
        label: 'Roadmaps',
        path: '/student/roadmaps'),
    _NavItem(
        icon: Icons.book_outlined,
        activeIcon: Icons.book_rounded,
        label: 'Courses',
        path: '/student/courses'),
    _NavItem(
        icon: Icons.work_outline_rounded,
        activeIcon: Icons.work_rounded,
        label: 'Careers',
        path: '/student/careers'),
    _NavItem(
        icon: Icons.quiz_outlined,
        activeIcon: Icons.quiz_rounded,
        label: 'Assess',
        path: '/student/assessments'),
  ];

  int _activeIndex(String location) {
    for (int i = _navItems.length - 1; i >= 0; i--) {
      if (location.startsWith(_navItems[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final idx = _activeIndex(location);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      key: _scaffoldKey,
      drawer: AppDrawer(
        items: _drawerItems,
        currentPath: location,
        accentColor: AppColors.teal,
      ),
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.slate900 : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.slate800 : AppColors.slate100,
            ),
          ),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: List.generate(_navItems.length, (i) {
                final item = _navItems[i];
                final isSelected = i == idx;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => context.go(item.path),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.teal.withOpacity(0.12)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Icon(
                            isSelected ? item.activeIcon : item.icon,
                            color: isSelected
                                ? AppColors.teal
                                : AppColors.slate400,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight:
                                isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected
                                ? AppColors.teal
                                : AppColors.slate400,
                          ),
                        ),
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

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.path,
  });
}
