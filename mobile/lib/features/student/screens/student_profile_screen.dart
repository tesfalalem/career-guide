import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';

// Unread notification count provider — used for badge
final _unreadCountProvider = FutureProvider<int>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.notificationsUnreadCount);
    return int.tryParse(res.data['count']?.toString() ?? '0') ?? 0;
  } catch (_) {
    return 0;
  }
});

class StudentProfileScreen extends ConsumerWidget {
  const StudentProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppHeader(title: 'My Profile'),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Avatar & name ────────────────────────────────────────────────
          Center(
            child: Column(
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.navy, AppColors.teal],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teal.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      user?.initials ?? '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(user?.name ?? '',
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text(user?.email ?? '',
                    style: const TextStyle(color: AppColors.slate400)),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.studentBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('Student',
                      style: TextStyle(
                          color: AppColors.studentBlue,
                          fontWeight: FontWeight.w700,
                          fontSize: 12)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // ── Info tiles ───────────────────────────────────────────────────
          _SectionLabel('Account Info'),
          const SizedBox(height: 12),
          _InfoTile(
              icon: Icons.school_outlined,
              label: 'Academic Year',
              value: user?.academicYear ?? 'Not set'),
          _InfoTile(
              icon: Icons.business_outlined,
              label: 'Department',
              value: user?.department ?? 'Not set'),
          _InfoTile(
              icon: Icons.email_outlined,
              label: 'Email',
              value: user?.email ?? ''),

          const SizedBox(height: 24),

          // ── Settings ─────────────────────────────────────────────────────
          _SectionLabel('Settings'),
          const SizedBox(height: 12),

          _SettingsTile(
            icon: isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
            label: isDark ? 'Light Mode' : 'Dark Mode',
            trailing: Switch(
              value: isDark,
              onChanged: (_) => ref.read(themeModeProvider.notifier).toggle(),
              activeColor: AppColors.teal,
            ),
          ),

          const SizedBox(height: 8),

          _SettingsTile(
            icon: Icons.notifications_outlined,
            label: 'Notifications',
            onTap: () => context.push('/notifications'),
            trailing: ref.watch(_unreadCountProvider).when(
                  data: (count) => count > 0
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.error,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                count > 99 ? '99+' : '$count',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.arrow_forward_ios_rounded,
                                size: 14, color: AppColors.slate400),
                          ],
                        )
                      : const Icon(Icons.arrow_forward_ios_rounded,
                          size: 14, color: AppColors.slate400),
                  loading: () => const Icon(Icons.arrow_forward_ios_rounded,
                      size: 14, color: AppColors.slate400),
                  error: (_, __) => const Icon(Icons.arrow_forward_ios_rounded,
                      size: 14, color: AppColors.slate400),
                ),
          ),

          const SizedBox(height: 24),

          // ── Logout ───────────────────────────────────────────────────────
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              icon: const Icon(Icons.logout_rounded,
                  color: AppColors.error, size: 18),
              label: const Text('Logout',
                  style: TextStyle(
                      color: AppColors.error, fontWeight: FontWeight.w700)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel(this.label);

  @override
  Widget build(BuildContext context) {
    return Text(label,
        style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.slate400,
            letterSpacing: 0.5));
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border:
            Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.teal, size: 20),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.slate400,
                      fontWeight: FontWeight.w600)),
              Text(value,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, fontSize: 14)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget trailing;
  final VoidCallback? onTap;
  const _SettingsTile(
      {required this.icon,
      required this.label,
      required this.trailing,
      this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        decoration: BoxDecoration(
          color: isDark ? AppColors.slate900 : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: isDark ? AppColors.slate800 : AppColors.slate100),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.teal, size: 20),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14)),
            ),
            trailing,
          ],
        ),
      ),
    );
  }
}
