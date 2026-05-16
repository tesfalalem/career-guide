import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/theme_provider.dart';
import '../../features/student/screens/student_shell.dart';

void _closeDrawer(BuildContext context) {
  // Use GlobalKey first, then fallback to Navigator.pop
  final scaffold = StudentShell.scaffoldKey.currentState;
  if (scaffold != null && scaffold.isDrawerOpen) {
    scaffold.closeDrawer();
  } else {
    Navigator.of(context).maybePop();
  }
}

class AppDrawer extends ConsumerWidget {
  final List<DrawerItem> items;
  final String currentPath;
  final Color accentColor;

  const AppDrawer({
    super.key,
    required this.items,
    required this.currentPath,
    this.accentColor = AppColors.teal,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Drawer(
      width: 280,
      backgroundColor: isDark ? AppColors.slate900 : Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.navy, accentColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo row
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.school_rounded,
                            color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 10),
                      RichText(
                        text: const TextSpan(
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                          children: [
                            TextSpan(text: 'Career'),
                            TextSpan(
                              text: 'Guide',
                              style: TextStyle(color: Color(0xFF5EEAD4)),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close_rounded,
                            color: Colors.white70, size: 20),
                        onPressed: () => _closeDrawer(context),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // User info
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        child: Text(
                          user?.initials ?? '?',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? '',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                _roleLabel(user?.role ?? 'student'),
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ── Nav Items ────────────────────────────────────────────────
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  ...items.map((item) => _DrawerNavItem(
                        item: item,
                        isActive: currentPath.startsWith(item.path),
                        accentColor: accentColor,
                        onTap: () {
                          _closeDrawer(context);
                          context.go(item.path);
                        },
                      )),
                  const Divider(height: 24, indent: 20, endIndent: 20),
                  _DrawerNavItem(
                    item: DrawerItem(
                      icon: Icons.notifications_outlined,
                      activeIcon: Icons.notifications_rounded,
                      label: 'Notifications',
                      path: '/notifications',
                    ),
                    isActive: currentPath == '/notifications',
                    accentColor: accentColor,
                    onTap: () {
                      _closeDrawer(context);
                      context.push('/notifications');
                    },
                  ),
                  _DrawerNavItem(
                    item: DrawerItem(
                      icon: Icons.support_agent_outlined,
                      activeIcon: Icons.support_agent_rounded,
                      label: 'Support',
                      path: '/support',
                    ),
                    isActive: currentPath == '/support',
                    accentColor: accentColor,
                    onTap: () {
                      _closeDrawer(context);
                      context.push('/support');
                    },
                  ),
                ],
              ),
            ),

            // ── Footer ───────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.slate800 : AppColors.slate100,
                  ),
                ),
              ),
              child: Column(
                children: [
                  // Theme toggle
                  InkWell(
                    onTap: () => ref.read(themeModeProvider.notifier).toggle(),
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      child: Row(
                        children: [
                          Icon(
                            isDark
                                ? Icons.light_mode_rounded
                                : Icons.dark_mode_rounded,
                            color: accentColor,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            isDark ? 'Light Mode' : 'Dark Mode',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: isDark ? Colors.white : AppColors.slate700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Logout
                  InkWell(
                    onTap: () {
                      context.go('/login');
                      ref.read(authProvider.notifier).logout();
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      child: Row(
                        children: [
                          const Icon(Icons.logout_rounded,
                              color: AppColors.error, size: 20),
                          const SizedBox(width: 12),
                          const Text(
                            'Logout',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: AppColors.error,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'teacher':
        return 'Teacher Portal';
      case 'admin':
        return 'Admin Portal';
      case 'bit':
        return 'BiT Academic';
      default:
        return 'Student Portal';
    }
  }
}

class _DrawerNavItem extends StatelessWidget {
  final DrawerItem item;
  final bool isActive;
  final Color accentColor;
  final VoidCallback onTap;

  const _DrawerNavItem({
    required this.item,
    required this.isActive,
    required this.accentColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: isActive ? accentColor.withOpacity(0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                Icon(
                  isActive ? item.activeIcon : item.icon,
                  color: isActive
                      ? accentColor
                      : (isDark ? AppColors.slate400 : AppColors.slate500),
                  size: 22,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    item.label,
                    style: TextStyle(
                      fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                      fontSize: 14,
                      color: isActive
                          ? accentColor
                          : (isDark ? AppColors.slate300 : AppColors.slate700),
                    ),
                  ),
                ),
                if (item.badge != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${item.badge}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class DrawerItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;
  final int? badge;

  DrawerItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.path,
    this.badge,
  });
}
