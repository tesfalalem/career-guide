import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/gradient_card.dart';
import '../providers/student_providers.dart';

class StudentHomeScreen extends ConsumerWidget {
  const StudentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final statsAsync = ref.watch(studentStatsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'Home', showLogo: true),
      body: RefreshIndicator(
        color: AppColors.teal,
        onRefresh: () => ref.refresh(studentStatsProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // ── Welcome card ─────────────────────────────────────────────
            GradientCard(
              badge: 'STUDENT PORTAL',
              title: 'Hello, ${user?.firstName ?? 'Student'} 👋',
              subtitle: 'Ready to level up today?',
              colors: const [AppColors.navy, Color(0xFF0369A1)],
              trailing: CircleAvatar(
                radius: 28,
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
            ),

            const SizedBox(height: 24),

            // ── Stats grid ───────────────────────────────────────────────
            statsAsync.when(
              loading: () => _StatsShimmer(),
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
                    label: 'Credits (XP)',
                    value: '${stats['totalXP'] ?? 0}',
                    icon: Icons.bolt_rounded,
                    color: AppColors.warning,
                  ),
                  InfoCard(
                    label: 'Courses',
                    value: '${stats['coursesEnrolled'] ?? 0}',
                    icon: Icons.book_rounded,
                    color: AppColors.teal,
                    onTap: () => context.go('/student/courses'),
                  ),
                  InfoCard(
                    label: 'Day Streak',
                    value: '${stats['streak'] ?? 0}',
                    icon: Icons.local_fire_department_rounded,
                    color: AppColors.error,
                  ),
                  InfoCard(
                    label: 'Lessons Done',
                    value: '${stats['completedLessons'] ?? 0}',
                    icon: Icons.check_circle_rounded,
                    color: AppColors.success,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── Quick actions ────────────────────────────────────────────
            _SectionLabel(title: 'Quick Actions'),
            const SizedBox(height: 14),
            Row(
              children: [
                QuickActionTile(
                  icon: Icons.map_rounded,
                  label: 'Roadmaps',
                  color: AppColors.navy,
                  onTap: () => context.go('/student/roadmaps'),
                ),
                const SizedBox(width: 10),
                QuickActionTile(
                  icon: Icons.book_rounded,
                  label: 'Courses',
                  color: AppColors.teal,
                  onTap: () => context.go('/student/courses'),
                ),
                const SizedBox(width: 10),
                QuickActionTile(
                  icon: Icons.quiz_rounded,
                  label: 'Assess',
                  color: AppColors.warning,
                  onTap: () => context.go('/student/assessments'),
                ),
                const SizedBox(width: 10),
                QuickActionTile(
                  icon: Icons.trending_up_rounded,
                  label: 'Progress',
                  color: AppColors.success,
                  onTap: () => context.go('/student/progress'),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // ── Explore section ──────────────────────────────────────────
            _SectionLabel(
                title: 'Explore',
                actionLabel: 'View all',
                onAction: () => context.go('/student/roadmaps')),
            const SizedBox(height: 14),
            _ExploreCard(
              icon: Icons.map_rounded,
              title: 'Career Roadmaps',
              subtitle: 'Follow structured paths to your dream career',
              color: AppColors.navy,
              onTap: () => context.go('/student/roadmaps'),
            ),
            const SizedBox(height: 10),
            _ExploreCard(
              icon: Icons.book_rounded,
              title: 'Curated Courses',
              subtitle: 'Learn from BiT-approved course content',
              color: AppColors.teal,
              onTap: () => context.go('/student/courses'),
            ),
            const SizedBox(height: 10),
            _ExploreCard(
              icon: Icons.quiz_rounded,
              title: 'Skill Assessments',
              subtitle: 'Test your knowledge and earn XP',
              color: AppColors.warning,
              onTap: () => context.go('/student/assessments'),
            ),

            const SizedBox(height: 28),

            // ── Support ──────────────────────────────────────────────────
            GestureDetector(
              onTap: () => context.push('/support'),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.teal.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.teal.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.teal.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.support_agent_rounded,
                          color: AppColors.teal, size: 24),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Need Help?',
                              style: TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 14)),
                          SizedBox(height: 2),
                          Text('Chat with our support team',
                              style: TextStyle(
                                  color: AppColors.slate500, fontSize: 12)),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios_rounded,
                        color: AppColors.teal, size: 14),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

// ── Reusable sub-widgets ──────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _SectionLabel({required this.title, this.actionLabel, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        if (actionLabel != null)
          GestureDetector(
            onTap: onAction,
            child: Text(actionLabel!,
                style: const TextStyle(
                    color: AppColors.teal,
                    fontWeight: FontWeight.w700,
                    fontSize: 13)),
          ),
      ],
    );
  }
}

class _ExploreCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ExploreCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.slate900 : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: isDark ? AppColors.slate800 : AppColors.slate100),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 14)),
                  const SizedBox(height: 3),
                  Text(subtitle,
                      style: const TextStyle(
                          color: AppColors.slate400, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: color, size: 14),
          ],
        ),
      ),
    );
  }
}

class _StatsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
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
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
    );
  }
}
