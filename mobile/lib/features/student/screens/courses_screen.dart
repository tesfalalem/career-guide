import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/student_providers.dart';
import '../../../core/models/course_model.dart';

class CoursesScreen extends ConsumerStatefulWidget {
  const CoursesScreen({super.key});

  @override
  ConsumerState<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends ConsumerState<CoursesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppHeader(
        title: 'Courses',
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded),
            onPressed: () => showSearch(
              context: context,
              delegate: _CourseSearchDelegate(ref),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Tabs ──────────────────────────────────────────────────────────
          Container(
            color: Theme.of(context).scaffoldBackgroundColor,
            child: TabBar(
              controller: _tabCtrl,
              labelColor: AppColors.teal,
              unselectedLabelColor: AppColors.slate400,
              indicatorColor: AppColors.teal,
              indicatorWeight: 2,
              labelStyle:
                  const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              tabs: const [
                Tab(text: 'My Courses'),
                Tab(text: 'Browse All'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabCtrl,
              children: [
                _MyCourses(),
                _BrowseCourses(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/student/courses/generate'),
        backgroundColor: AppColors.teal,
        icon: const Icon(Icons.auto_stories_rounded, color: Colors.white),
        label: const Text(
          'AI Custom Course',
          style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
        ),
      ),
    );
  }
}

class _MyCourses extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(enrolledCoursesProvider);
    return coursesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: AppColors.teal)),
      error: (_, __) => const _EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Failed to load courses',
          subtitle: 'Pull down to retry'),
      data: (courses) => courses.isEmpty
          ? _EmptyState(
              icon: Icons.book_outlined,
              title: 'No courses yet',
              subtitle: 'Browse all courses to enroll',
              action: TextButton(
                onPressed: () {},
                child: const Text('Browse Courses'),
              ),
            )
          : RefreshIndicator(
              color: AppColors.teal,
              onRefresh: () => ref.refresh(enrolledCoursesProvider.future),
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                itemCount: courses.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) =>
                    _CourseCard(course: courses[i], showProgress: true),
              ),
            ),
    );
  }
}

class _BrowseCourses extends ConsumerStatefulWidget {
  @override
  ConsumerState<_BrowseCourses> createState() => _BrowseCoursesState();
}

class _BrowseCoursesState extends ConsumerState<_BrowseCourses> {
  // Track which course IDs are currently being enrolled
  final Set<String> _enrolling = {};
  // Track which course IDs have been enrolled this session
  final Set<String> _enrolled = {};

  Future<void> _enroll(String courseId) async {
    if (_enrolling.contains(courseId)) return;
    setState(() => _enrolling.add(courseId));
    try {
      final success = await enrollInCourse(ref, courseId);
      if (success && mounted) {
        setState(() => _enrolled.add(courseId));
        // Refresh My Courses tab
        ref.invalidate(enrolledCoursesProvider);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Enrolled successfully!'),
            backgroundColor: AppColors.teal,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Enrollment failed. Please try again.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _enrolling.remove(courseId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final coursesAsync = ref.watch(allCoursesProvider);
    return coursesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: AppColors.teal)),
      error: (_, __) => const _EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Failed to load courses',
          subtitle: 'Pull down to retry'),
      data: (courses) => courses.isEmpty
          ? const _EmptyState(
              icon: Icons.book_outlined,
              title: 'No courses available',
              subtitle: 'Check back later')
          : RefreshIndicator(
              color: AppColors.teal,
              onRefresh: () => ref.refresh(allCoursesProvider.future),
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                itemCount: courses.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final course = courses[i];
                  final isEnrolling = _enrolling.contains(course.id);
                  final isEnrolled = _enrolled.contains(course.id);
                  return _CourseCard(
                    course: course,
                    showProgress: false,
                    enrollButton: _EnrollButton(
                      isEnrolling: isEnrolling,
                      isEnrolled: isEnrolled,
                      onEnroll: () => _enroll(course.id),
                    ),
                  );
                },
              ),
            ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final CourseModel course;
  final bool showProgress;
  final Widget? enrollButton;
  const _CourseCard(
      {required this.course, required this.showProgress, this.enrollButton});

  Color get _levelColor {
    switch (course.level) {
      case 'Advanced':
        return AppColors.adminIndigo;
      case 'Intermediate':
        return AppColors.navy;
      default:
        return AppColors.success;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () => context.push('/student/courses/${course.id}'),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _levelColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(course.level,
                      style: TextStyle(
                          color: _levelColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(course.title,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w800),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
            if (course.description.isNotEmpty) ...[
              const SizedBox(height: 5),
              Text(course.description,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],

            // Progress bar
            if (showProgress && course.progress != null) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Progress',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.slate400)),
                  Text('${course.progress}%',
                      style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.teal)),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (course.progress ?? 0) / 100,
                  backgroundColor: AppColors.slate100,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppColors.teal),
                  minHeight: 6,
                ),
              ),
            ],

            const SizedBox(height: 12),
            // Enroll button (browse tab only)
            if (enrollButton != null) ...[
              enrollButton!,
              const SizedBox(height: 10),
            ],
            Row(
              children: [
                const Icon(Icons.access_time_rounded,
                    size: 13, color: AppColors.slate400),
                const SizedBox(width: 4),
                Text(course.duration,
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.slate400,
                        fontWeight: FontWeight.w600)),
                const SizedBox(width: 12),
                const Icon(Icons.layers_rounded,
                    size: 13, color: AppColors.slate400),
                const SizedBox(width: 4),
                Text('${course.modules.length} modules',
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.slate400,
                        fontWeight: FontWeight.w600)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.arrow_forward_rounded,
                      size: 14, color: AppColors.teal),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EnrollButton extends StatelessWidget {
  final bool isEnrolling;
  final bool isEnrolled;
  final VoidCallback onEnroll;

  const _EnrollButton({
    required this.isEnrolling,
    required this.isEnrolled,
    required this.onEnroll,
  });

  @override
  Widget build(BuildContext context) {
    if (isEnrolled) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(
          color: AppColors.teal.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.teal.withOpacity(0.3)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_rounded, color: AppColors.teal, size: 16),
            SizedBox(width: 6),
            Text(
              'Enrolled',
              style: TextStyle(
                color: AppColors.teal,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ],
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: isEnrolling ? null : onEnroll,
        icon: isEnrolling
            ? const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : const Icon(Icons.add_rounded, size: 16),
        label: Text(isEnrolling ? 'Enrolling...' : 'Enroll Now'),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.navy,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 11),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? action;
  const _EmptyState(
      {required this.icon,
      required this.title,
      required this.subtitle,
      this.action});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 56, color: AppColors.slate300),
            const SizedBox(height: 16),
            Text(title,
                style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: AppColors.slate600)),
            const SizedBox(height: 6),
            Text(subtitle,
                style: const TextStyle(color: AppColors.slate400, fontSize: 13),
                textAlign: TextAlign.center),
            if (action != null) ...[const SizedBox(height: 16), action!],
          ],
        ),
      ),
    );
  }
}

class _CourseSearchDelegate extends SearchDelegate<String> {
  final WidgetRef ref;
  _CourseSearchDelegate(this.ref);

  @override
  List<Widget> buildActions(BuildContext context) => [
        IconButton(
            icon: const Icon(Icons.close_rounded),
            onPressed: () => close(context, ''))
      ];

  @override
  Widget buildLeading(BuildContext context) => IconButton(
      icon: const Icon(Icons.arrow_back_rounded),
      onPressed: () => close(context, ''));

  @override
  Widget buildResults(BuildContext context) => buildSuggestions(context);

  @override
  Widget buildSuggestions(BuildContext context) {
    final coursesAsync = ref.watch(allCoursesProvider);
    return coursesAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: AppColors.teal)),
      error: (_, __) => const SizedBox.shrink(),
      data: (courses) {
        final filtered = courses
            .where((c) =>
                c.title.toLowerCase().contains(query.toLowerCase()) ||
                c.description.toLowerCase().contains(query.toLowerCase()))
            .toList();
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) =>
              _CourseCard(course: filtered[i], showProgress: false),
        );
      },
    );
  }
}
