import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/gradient_card.dart';

final _teacherStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.teacherStats);
    return Map<String, dynamic>.from(res.data['stats'] ?? res.data);
  } catch (_) {
    return {};
  }
});

final _teacherActivityProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.teacherActivity);
    final list = res.data['activities'] as List? ?? [];
    return list.map((a) => Map<String, dynamic>.from(a)).toList();
  } catch (_) {
    return [];
  }
});

class TeacherHomeScreen extends ConsumerWidget {
  const TeacherHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final statsAsync = ref.watch(_teacherStatsProvider);
    final activityAsync = ref.watch(_teacherActivityProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(title: 'Teacher Portal', showLogo: true),
      body: RefreshIndicator(
        color: AppColors.teacherTeal,
        onRefresh: () async {
          ref.invalidate(_teacherStatsProvider);
          ref.invalidate(_teacherActivityProvider);
          await ref.read(_teacherStatsProvider.future);
          await ref.read(_teacherActivityProvider.future);
        },
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            GradientCard(
              badge: 'TEACHER PORTAL',
              title: 'Hello, ${user?.firstName ?? 'Teacher'} 👋',
              subtitle: 'Manage your resources & students',
              colors: const [AppColors.navy, AppColors.teacherTeal],
              trailing: CircleAvatar(
                radius: 26,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(user?.initials ?? '?',
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15)),
              ),
            ),
            const SizedBox(height: 24),
            statsAsync.when(
              loading: () => _shimmerGrid(),
              error: (_, __) => const SizedBox.shrink(),
              data: (stats) => GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
                children: [
                  InfoCard(
                      label: 'Resources',
                      value: '${stats['totalResources'] ?? 0}',
                      icon: Icons.folder_rounded,
                      color: AppColors.teacherTeal,
                      onTap: () => context.go('/teacher/resources')),
                  InfoCard(
                      label: 'Approved',
                      value: '${stats['approvedResources'] ?? 0}',
                      icon: Icons.check_circle_rounded,
                      color: AppColors.success),
                  InfoCard(
                      label: 'Pending',
                      value: '${stats['pendingResources'] ?? 0}',
                      icon: Icons.hourglass_top_rounded,
                      color: AppColors.warning),
                  InfoCard(
                      label: 'Students',
                      value: '${stats['activeStudents'] ?? 0}',
                      icon: Icons.people_rounded,
                      color: AppColors.navy,
                      onTap: () => context.go('/teacher/students')),
                ],
              ),
            ),
            const SizedBox(height: 28),
            const _SectionLabel(title: 'Quick Actions'),
            const SizedBox(height: 14),
            Row(
              children: [
                QuickActionTile(
                  icon: Icons.upload_file_rounded,
                  label: 'Upload',
                  color: AppColors.teacherTeal,
                  onTap: () => context.go('/teacher/resources'),
                ),
                const SizedBox(width: 10),
                QuickActionTile(
                  icon: Icons.people_rounded,
                  label: 'Students',
                  color: AppColors.navy,
                  onTap: () => context.go('/teacher/students'),
                ),
                const SizedBox(width: 10),
                QuickActionTile(
                  icon: Icons.bar_chart_rounded,
                  label: 'Analytics',
                  color: AppColors.success,
                  onTap: () => context.go('/teacher/analytics'),
                ),
                const SizedBox(width: 10),
                QuickActionTile(
                  icon: Icons.person_rounded,
                  label: 'Profile',
                  color: AppColors.warning,
                  onTap: () => context.go('/teacher/profile'),
                ),
              ],
            ),
            const SizedBox(height: 28),
            const _SectionLabel(title: 'Recent Activity'),
            const SizedBox(height: 14),
            activityAsync.when(
              loading: () => const Center(
                  child: Padding(
                padding: EdgeInsets.all(20.0),
                child: CircularProgressIndicator(color: AppColors.teacherTeal),
              )),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (activities) => activities.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        child: Text(
                          'No recent activity',
                          style: TextStyle(color: AppColors.slate400),
                        ),
                      ),
                    )
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activities.length > 5 ? 5 : activities.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, i) {
                        final act = activities[i];
                        final isResource = act['type'] == 'resource';

                        IconData iconData = Icons.info_outline;
                        Color iconColor = AppColors.teacherTeal;
                        if (isResource) {
                          iconData = Icons.upload_file_rounded;
                          if (act['status'] == 'approved') {
                            iconColor = AppColors.success;
                          } else if (act['status'] == 'rejected') {
                            iconColor = AppColors.error;
                          } else {
                            iconColor = AppColors.warning;
                          }
                        } else {
                          iconData = Icons.feedback_rounded;
                          iconColor = AppColors.navy;
                        }

                        final dateStr = act['date'] != null
                            ? timeago.format(DateTime.parse(act['date']))
                            : '';

                        return Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.slate900 : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                                color: isDark
                                    ? AppColors.slate800
                                    : AppColors.slate100),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: iconColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child:
                                    Icon(iconData, color: iconColor, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      act['title'] ?? '',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13),
                                    ),
                                    if (act['details'] != null) ...[
                                      const SizedBox(height: 2),
                                      Text(
                                        act['details'],
                                        style: const TextStyle(
                                            color: AppColors.slate400,
                                            fontSize: 11),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                dateStr,
                                style: const TextStyle(
                                    color: AppColors.slate400, fontSize: 10),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
            const SizedBox(height: 20),
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

class _SectionLabel extends StatelessWidget {
  final String title;
  const _SectionLabel({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
            fontSize: 16,
          ),
    );
  }
}
