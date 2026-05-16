import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/student_providers.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(studentStatsProvider);
    final activityAsync = ref.watch(recentActivityProvider);

    return Scaffold(
      appBar: AppHeader(title: 'My Progress'),
      body: RefreshIndicator(
        color: AppColors.teal,
        onRefresh: () async {
          ref.invalidate(studentStatsProvider);
          ref.invalidate(recentActivityProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // ── Stats overview ───────────────────────────────────────────
            statsAsync.when(
              loading: () => _shimmer(),
              error: (_, __) => const SizedBox.shrink(),
              data: (stats) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Overview',
                      style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.6,
                    children: [
                      _StatTile(
                          label: 'Total XP',
                          value: '${stats['totalXP'] ?? 0}',
                          icon: Icons.bolt_rounded,
                          color: AppColors.warning),
                      _StatTile(
                          label: 'Courses',
                          value: '${stats['coursesEnrolled'] ?? 0}',
                          icon: Icons.book_rounded,
                          color: AppColors.teal),
                      _StatTile(
                          label: 'Lessons Done',
                          value: '${stats['completedLessons'] ?? 0}',
                          icon: Icons.check_circle_rounded,
                          color: AppColors.success),
                      _StatTile(
                          label: 'Day Streak',
                          value: '${stats['streak'] ?? 0}',
                          icon: Icons.local_fire_department_rounded,
                          color: AppColors.error),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── XP Progress bar ──────────────────────────────────────────
            statsAsync.maybeWhen(
              data: (stats) {
                final xp = stats['totalXP'] ?? 0;
                final nextLevel = ((xp ~/ 1000) + 1) * 1000;
                final progress = (xp % 1000) / 1000.0;
                return _XpCard(
                    xp: xp, nextLevel: nextLevel, progress: progress);
              },
              orElse: () => const SizedBox.shrink(),
            ),

            const SizedBox(height: 28),

            // ── Recent activity ──────────────────────────────────────────
            Text('Recent Activity',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            activityAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.teal)),
              error: (_, __) => const SizedBox.shrink(),
              data: (activities) => activities.isEmpty
                  ? Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardTheme.color,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.slate100),
                      ),
                      child: const Center(
                        child: Text('No recent activity',
                            style: TextStyle(color: AppColors.slate400)),
                      ),
                    )
                  : Column(
                      children: activities
                          .map((a) => _ActivityItem(activity: a))
                          .toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmer() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: List.generate(
          4,
          (_) => Container(
                decoration: BoxDecoration(
                    color: AppColors.slate100,
                    borderRadius: BorderRadius.circular(16)),
              )),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : AppColors.slate900)),
              Text(label,
                  style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.slate400)),
            ],
          ),
        ],
      ),
    );
  }
}

class _XpCard extends StatelessWidget {
  final int xp;
  final int nextLevel;
  final double progress;

  const _XpCard(
      {required this.xp, required this.nextLevel, required this.progress});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.navy, Color(0xFF0369A1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('XP Progress',
                  style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w600)),
              Text('$xp / $nextLevel XP',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white.withOpacity(0.2),
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.tealLight),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '${((1 - progress) * 1000).round()} XP to next level',
            style: const TextStyle(color: Colors.white60, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final Map<String, dynamic> activity;
  const _ActivityItem({required this.activity});

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
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.teal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.bookmark_rounded,
                color: AppColors.teal, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity['title'] ?? '',
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text(activity['category'] ?? '',
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.slate400)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
