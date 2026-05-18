import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../features/student/screens/student_shell.dart';

/// Reusable top app bar used across all role dashboards.
class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showLogo;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final bool showDrawerButton;
  final bool showBackButton;

  const AppHeader({
    super.key,
    required this.title,
    this.showLogo = false,
    this.actions,
    this.backgroundColor,
    this.showDrawerButton = true,
    this.showBackButton = false,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  void _openDrawer(BuildContext context) {
    // First try the GlobalKey from StudentShell
    final globalScaffold = StudentShell.scaffoldKey.currentState;
    if (globalScaffold != null && globalScaffold.hasDrawer) {
      globalScaffold.openDrawer();
      return;
    }

    // Fallback: walk up the widget tree
    context.visitAncestorElements((element) {
      if (element is StatefulElement && element.state is ScaffoldState) {
        final s = element.state as ScaffoldState;
        if (s.hasDrawer) {
          s.openDrawer();
          return false;
        }
      }
      return true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = backgroundColor ?? (isDark ? AppColors.slate900 : Colors.white);

    return AppBar(
      backgroundColor: bg,
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      leading: showBackButton
          ? IconButton(
              icon: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.slate800 : AppColors.slate100,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.arrow_back_rounded,
                  color: isDark ? Colors.white : AppColors.navy,
                  size: 20,
                ),
              ),
              onPressed: () => context.pop(),
            )
          : (showDrawerButton
              ? IconButton(
                  icon: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.slate800 : AppColors.slate100,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.menu_rounded,
                      color: isDark ? Colors.white : AppColors.navy,
                      size: 20,
                    ),
                  ),
                  onPressed: () => _openDrawer(context),
                )
              : null),
      title: showLogo
          ? RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppColors.navy,
                ),
                children: const [
                  TextSpan(text: 'Career'),
                  TextSpan(
                    text: 'Guide',
                    style: TextStyle(color: AppColors.teal),
                  ),
                ],
              ),
            )
          : Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppColors.navy,
              ),
            ),
      actions: [
        ...?actions,
        IconButton(
          icon: Icon(
            Icons.notifications_outlined,
            color: isDark ? Colors.white70 : AppColors.slate600,
          ),
          onPressed: () => context.push('/notifications'),
        ),
        const SizedBox(width: 4),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Divider(
          height: 1,
          color: isDark ? AppColors.slate800 : AppColors.slate100,
        ),
      ),
    );
  }
}
