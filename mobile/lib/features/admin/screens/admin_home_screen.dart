import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/gradient_card.dart';

final _adminAnalyticsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.adminAnalytics);
    return Map<String, dynamic>.from(res.data);
  } catch (_) {
    return {};
  }
});

class AdminHomeScreen extends ConsumerWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final analyticsAsync = ref.watch(_adminAnalyticsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'Admin Portal', showLogo: true),
      body: RefreshIndicator(
        color: AppColors.adminIndigo,
        onRefresh: () => ref.refresh(_adminAnalyticsProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            GradientCard(
              badge: 'ADMIN PORTAL',
              title: 'Hello, ${user?.firstName ?? 'Admin'} 👋',
              subtitle: 'Platform Management Console',
              colors: const [AppColors.adminIndigo, Color(0xFF6366F1)],
              trailing: const Icon(Icons.admin_panel_settings_rounded,
                  color: Colors.white30, size: 44),
            ),
            const SizedBox(height: 24),
            analyticsAsync.when(
              loading: () => _shimmerGrid(),
              error: (_, __) => const SizedBox.shrink(),
              data: (data) => GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
                children: [
                  InfoCard(
                      label: 'Total Users',
                      value: '${data['total_users'] ?? 0}',
                      icon: Icons.people_rounded,
                      color: AppColors.adminIndigo),
                  InfoCard(
                      label: 'Students',
                      value: '${data['total_students'] ?? 0}',
                      icon: Icons.school_rounded,
                      color: AppColors.studentBlue),
                  InfoCard(
                      label: 'Teachers',
                      value: '${data['total_teachers'] ?? 0}',
                      icon: Icons.cast_for_education_rounded,
                      color: AppColors.teacherTeal),
                  InfoCard(
                      label: 'Pending',
                      value: '${data['pending_approvals'] ?? 0}',
                      icon: Icons.hourglass_top_rounded,
                      color: AppColors.warning),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => context.go('/admin/approvals'),
                    icon: const Icon(Icons.check_circle_rounded, size: 18),
                    label: const Text('Approvals'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.adminIndigo,
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/admin/users'),
                    icon: const Icon(Icons.people_rounded, size: 18),
                    label: const Text('Users'),
                    style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.adminIndigo,
                        side: const BorderSide(color: AppColors.adminIndigo),
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmerGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: List.generate(
          4,
          (_) => Container(
                decoration: BoxDecoration(
                    color: AppColors.slate100,
                    borderRadius: BorderRadius.circular(20)),
              )),
    );
  }
}
