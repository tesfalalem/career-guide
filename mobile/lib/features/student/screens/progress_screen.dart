import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/course_model.dart';
import '../providers/student_providers.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(studentStatsProvider);
    final coursesAsync = ref.watch(enrolledCoursesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        color: AppColors.teal,
        onRefresh: () async {
          ref.invalidate(studentStatsProvider);
          ref.invalidate(enrolledCoursesProvider);
        },
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──────────────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 140,
              pinned: true,
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              iconTheme: const IconThemeData(color: Colors.white),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.navy, Color(0xFF0369A1)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 56, 20, 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          const Text('Performance Analytics',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          statsAsync.when(
                            loading: () => const SizedBox.shrink(),
                            error: (_, __) => const SizedBox.shrink(),
                            data: (stats) => Text(
                              'Tracking growth across ${(stats['coursesEnrolled'] ?? 0)} active learning paths',
                              style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── Stats Row ─────────────────────────────────────────
                  statsAsync.when(
                    loading: () => const Center(
                        child:
                            CircularProgressIndicator(color: AppColors.teal)),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (stats) => Row(
                      children: [
                        _StatCard(
                          value: '${stats['coursesEnrolled'] ?? 0}',
                          label: 'Courses',
                          icon: Icons.book_outlined,
                          color: AppColors.teal,
                          isDark: isDark,
                        ),
                        const SizedBox(width: 12),
                        _StatCard(
                          value: '${stats['completedLessons'] ?? 0}',
                          label: 'Lessons Done',
                          icon: Icons.check_circle_outline_rounded,
                          color: AppColors.success,
                          isDark: isDark,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Active Focus Areas ────────────────────────────────
                  Text('Active Focus Areas',
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 14),

                  coursesAsync.when(
                    loading: () => const Center(
                        child:
                            CircularProgressIndicator(color: AppColors.teal)),
                    error: (_, __) => const _EmptyProgress(),
                    data: (courses) => courses.isEmpty
                        ? const _EmptyProgress()
                        : Column(
                            children: courses
                                .map((c) => _CourseProgressCard(
                                    course: c, isDark: isDark))
                                .toList(),
                          ),
                  ),

                  const SizedBox(height: 28),

                  // ── Credentials ───────────────────────────────────────
                  Text('Institutional Credentials',
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 14),

                  _CredentialCard(
                    title: 'Student Hub Verified',
                    org: 'BiT Admin',
                    status: 'Active',
                    isDark: isDark,
                  ),
                  const SizedBox(height: 10),
                  _CredentialCard(
                    title: 'Early Adopter',
                    org: 'CareerGuide',
                    status: 'Badge',
                    isDark: isDark,
                  ),

                  const SizedBox(height: 28),

                  // ── Weekly Sprint ─────────────────────────────────────
                  Text('Weekly Sprint',
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 14),

                  coursesAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (courses) =>
                        _WeeklySprint(courses: courses, isDark: isDark),
                  ),

                  const SizedBox(height: 24),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;
  final bool isDark;

  const _StatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.slate900 : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: isDark ? AppColors.slate800 : AppColors.slate100),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value,
                    style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: color)),
                Text(label,
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.slate400,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Course Progress Card ──────────────────────────────────────────────────────
class _CourseProgressCard extends StatelessWidget {
  final CourseModel course;
  final bool isDark;

  const _CourseProgressCard({required this.course, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final progress = (course.progress ?? 0) / 100;
    final levelColor = course.level == 'Advanced'
        ? AppColors.adminIndigo
        : course.level == 'Intermediate'
            ? AppColors.navy
            : AppColors.teal;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(course.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: levelColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(course.level,
                    style: TextStyle(
                        color: levelColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Progress',
                  style: TextStyle(
                      fontSize: 11,
                      color: AppColors.slate400,
                      fontWeight: FontWeight.w600)),
              Text('${course.progress ?? 0}%',
                  style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.teal,
                      fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.slate100,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.teal),
              minHeight: 7,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Credential Card ───────────────────────────────────────────────────────────
class _CredentialCard extends StatelessWidget {
  final String title;
  final String org;
  final String status;
  final bool isDark;

  const _CredentialCard({
    required this.title,
    required this.org,
    required this.status,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.teal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.verified_rounded,
                color: AppColors.teal, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 2),
                Text('$org · $status',
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.slate400,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Weekly Sprint ─────────────────────────────────────────────────────────────
class _WeeklySprint extends StatelessWidget {
  final List<CourseModel> courses;
  final bool isDark;

  const _WeeklySprint({required this.courses, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final goals = [
      {
        'label': 'Complete 3 Lessons',
        'done': courses.any((c) => c.completedLessons.isNotEmpty)
      },
      {'label': 'Enroll in a Course', 'done': courses.isNotEmpty},
      {'label': 'Visit Dashboard', 'done': true},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
      ),
      child: Column(
        children: goals.map((g) {
          final done = g['done'] as bool;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: done ? AppColors.teal : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: done ? AppColors.teal : AppColors.slate300,
                      width: 2,
                    ),
                  ),
                  child: done
                      ? const Icon(Icons.check_rounded,
                          color: Colors.white, size: 14)
                      : null,
                ),
                const SizedBox(width: 14),
                Text(
                  g['label'] as String,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: done ? AppColors.slate400 : null,
                    decoration: done ? TextDecoration.lineThrough : null,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────
class _EmptyProgress extends StatelessWidget {
  const _EmptyProgress();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.dark
            ? AppColors.slate900
            : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.slate100),
      ),
      child: const Column(
        children: [
          Icon(Icons.book_outlined, size: 48, color: AppColors.slate300),
          SizedBox(height: 12),
          Text('No active courses yet',
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: AppColors.slate500)),
          SizedBox(height: 6),
          Text('Start a roadmap to track your skills',
              style: TextStyle(color: AppColors.slate400, fontSize: 13),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
