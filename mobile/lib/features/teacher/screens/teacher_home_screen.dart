import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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

class TeacherHomeScreen extends ConsumerWidget {
  const TeacherHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final statsAsync = ref.watch(_teacherStatsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'Teacher Portal', showLogo: true),
      body: RefreshIndicator(
        color: AppColors.teacherTeal,
        onRefresh: () => ref.refresh(_teacherStatsProvider.future),
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
                      color: AppColors.teacherTeal),
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
                      color: AppColors.navy),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => context.go('/teacher/resources'),
                    icon: const Icon(Icons.upload_rounded, size: 18),
                    label: const Text('Upload Resource'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.teacherTeal,
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/teacher/students'),
                    icon: const Icon(Icons.people_rounded, size: 18),
                    label: const Text('My Students'),
                    style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.navy,
                        side: const BorderSide(color: AppColors.slate200),
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
