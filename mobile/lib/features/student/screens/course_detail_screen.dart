import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/course_model.dart';

final _courseDetailProvider =
    FutureProvider.family<CourseModel, String>((ref, id) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.courses}/$id');
  return CourseModel.fromJson(res.data);
});

class CourseDetailScreen extends ConsumerStatefulWidget {
  final String courseId;
  const CourseDetailScreen({super.key, required this.courseId});

  @override
  ConsumerState<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends ConsumerState<CourseDetailScreen> {
  int? _activeModuleIdx;
  int? _activeLessonIdx;

  @override
  Widget build(BuildContext context) {
    final courseAsync = ref.watch(_courseDetailProvider(widget.courseId));

    return courseAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.teal)),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Error: $e')),
      ),
      data: (course) {
        // Lesson viewer mode
        if (_activeModuleIdx != null && _activeLessonIdx != null) {
          final lesson =
              course.modules[_activeModuleIdx!].lessons[_activeLessonIdx!];
          return _LessonViewer(
            lesson: lesson,
            course: course,
            moduleIdx: _activeModuleIdx!,
            lessonIdx: _activeLessonIdx!,
            onBack: () => setState(() {
              _activeModuleIdx = null;
              _activeLessonIdx = null;
            }),
            onNext: () {
              final mod = course.modules[_activeModuleIdx!];
              if (_activeLessonIdx! < mod.lessons.length - 1) {
                setState(() => _activeLessonIdx = _activeLessonIdx! + 1);
              } else if (_activeModuleIdx! < course.modules.length - 1) {
                setState(() {
                  _activeModuleIdx = _activeModuleIdx! + 1;
                  _activeLessonIdx = 0;
                });
              }
            },
            isLast: _activeModuleIdx == course.modules.length - 1 &&
                _activeLessonIdx ==
                    course.modules[_activeModuleIdx!].lessons.length - 1,
          );
        }

        // Course overview
        return _CourseOverview(
          course: course,
          onOpenLesson: (mIdx, lIdx) => setState(() {
            _activeModuleIdx = mIdx;
            _activeLessonIdx = lIdx;
          }),
        );
      },
    );
  }
}

// ── Course Overview ───────────────────────────────────────────────────────────
class _CourseOverview extends StatefulWidget {
  final CourseModel course;
  final void Function(int mIdx, int lIdx) onOpenLesson;
  const _CourseOverview({required this.course, required this.onOpenLesson});

  @override
  State<_CourseOverview> createState() => _CourseOverviewState();
}

class _CourseOverviewState extends State<_CourseOverview> {
  final Set<int> _expanded = {0};

  @override
  Widget build(BuildContext context) {
    final course = widget.course;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── Hero ──────────────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: AppColors.navy,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.navy, AppColors.teal],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 56, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(course.level,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5)),
                        ),
                        const SizedBox(height: 8),
                        Text(course.title,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
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
                // ── Meta ────────────────────────────────────────────────
                Row(
                  children: [
                    _MetaChip(
                        icon: Icons.access_time_rounded,
                        label: course.duration),
                    const SizedBox(width: 10),
                    _MetaChip(
                        icon: Icons.layers_rounded,
                        label: '${course.modules.length} modules'),
                    const SizedBox(width: 10),
                    _MetaChip(
                        icon: Icons.quiz_rounded,
                        label: '${course.totalLessons} lessons'),
                  ],
                ),

                if (course.description.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Text(course.description,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(height: 1.6)),
                ],

                // Progress
                if (course.progress != null) ...[
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Your Progress',
                          style: TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 13)),
                      Text('${course.progress}%',
                          style: const TextStyle(
                              color: AppColors.teal,
                              fontWeight: FontWeight.w700,
                              fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: (course.progress ?? 0) / 100,
                      backgroundColor: AppColors.slate100,
                      valueColor:
                          const AlwaysStoppedAnimation<Color>(AppColors.teal),
                      minHeight: 8,
                    ),
                  ),
                ],

                const SizedBox(height: 24),

                // ── Curriculum ──────────────────────────────────────────
                Text('Course Curriculum',
                    style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 14),

                ...course.modules.asMap().entries.map((mEntry) {
                  final mIdx = mEntry.key;
                  final module = mEntry.value;
                  final isExpanded = _expanded.contains(mIdx);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.slate900 : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isExpanded
                            ? AppColors.teal.withOpacity(0.3)
                            : (isDark
                                ? AppColors.slate800
                                : AppColors.slate100),
                      ),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          onTap: () => setState(() {
                            if (isExpanded)
                              _expanded.remove(mIdx);
                            else
                              _expanded.add(mIdx);
                          }),
                          leading: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: isExpanded
                                  ? AppColors.teal.withOpacity(0.12)
                                  : AppColors.slate100,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text('${mIdx + 1}',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13,
                                      color: isExpanded
                                          ? AppColors.teal
                                          : AppColors.slate500)),
                            ),
                          ),
                          title: Text(module.title,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 14)),
                          subtitle: Text(
                              '${module.lessons.length} lesson${module.lessons.length != 1 ? 's' : ''}',
                              style: const TextStyle(
                                  fontSize: 12, color: AppColors.slate400)),
                          trailing: AnimatedRotation(
                            turns: isExpanded ? 0.5 : 0,
                            duration: const Duration(milliseconds: 200),
                            child: const Icon(Icons.keyboard_arrow_down_rounded,
                                color: AppColors.slate400),
                          ),
                        ),
                        if (isExpanded) ...[
                          const Divider(height: 1),
                          ...module.lessons.asMap().entries.map((lEntry) {
                            final lIdx = lEntry.key;
                            final lesson = lEntry.value;
                            return ListTile(
                              onTap: () => widget.onOpenLesson(mIdx, lIdx),
                              leading: Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: AppColors.teal.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(
                                    Icons.play_circle_outline_rounded,
                                    color: AppColors.teal,
                                    size: 18),
                              ),
                              title: Text(lesson.title,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600)),
                              subtitle: Text(lesson.duration,
                                  style: const TextStyle(
                                      fontSize: 11, color: AppColors.slate400)),
                              trailing: const Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  size: 12,
                                  color: AppColors.teal),
                            );
                          }),
                        ],
                      ],
                    ),
                  );
                }),

                const SizedBox(height: 20),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Lesson Viewer ─────────────────────────────────────────────────────────────
class _LessonViewer extends StatelessWidget {
  final LessonModel lesson;
  final CourseModel course;
  final int moduleIdx;
  final int lessonIdx;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final bool isLast;

  const _LessonViewer({
    required this.lesson,
    required this.course,
    required this.moduleIdx,
    required this.lessonIdx,
    required this.onBack,
    required this.onNext,
    required this.isLast,
  });

  bool _isHtml(String s) =>
      RegExp(r'<[a-z][\s\S]*>', caseSensitive: false).hasMatch(s);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final totalLessons =
        course.modules.fold<int>(0, (sum, m) => sum + m.lessons.length);
    int lessonNumber = 0;
    for (int m = 0; m < moduleIdx; m++) {
      lessonNumber += course.modules[m].lessons.length;
    }
    lessonNumber += lessonIdx + 1;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: isDark ? AppColors.slate900 : Colors.white,
        foregroundColor: isDark ? Colors.white : AppColors.navy,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: onBack,
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(lesson.title,
                style:
                    const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                overflow: TextOverflow.ellipsis),
            Text('Lesson $lessonNumber of $totalLessons',
                style:
                    const TextStyle(fontSize: 11, color: AppColors.slate400)),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(3),
          child: LinearProgressIndicator(
            value: lessonNumber / totalLessons,
            backgroundColor: AppColors.slate100,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.teal),
            minHeight: 3,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(lesson.title,
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text(lesson.duration,
                      style: const TextStyle(
                          color: AppColors.slate400, fontSize: 12)),
                  const SizedBox(height: 20),
                  _buildContent(context, lesson.content),
                ],
              ),
            ),
          ),

          // ── Navigation ─────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            decoration: BoxDecoration(
              color: isDark ? AppColors.slate900 : Colors.white,
              border: const Border(top: BorderSide(color: AppColors.slate100)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onBack,
                      icon: const Icon(Icons.arrow_back_rounded, size: 16),
                      label: const Text('Back'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  if (!isLast) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: onNext,
                        icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                        label: const Text('Next Lesson'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.teal,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ] else ...[
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: onBack,
                        icon: const Icon(Icons.check_circle_rounded, size: 16),
                        label: const Text('Complete'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, String content) {
    if (content.isEmpty || content == '[CONTENT_PENDING]') {
      return const Text('Content not yet available.',
          style: TextStyle(
              color: AppColors.slate400, fontStyle: FontStyle.italic));
    }

    // Try JSON block array
    try {
      final parsed = List<dynamic>.from(
          (content.startsWith('[')) ? _parseJson(content) : []);
      if (parsed.isNotEmpty) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: parsed.map<Widget>((block) {
            final type = block['type'] ?? 'text';
            final text = block['text'] ?? block['content'] ?? '';
            if (type == 'text') {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _isHtml(text)
                    ? _HtmlText(html: text)
                    : MarkdownBody(data: text),
              );
            }
            if (type == 'link') {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    const Icon(Icons.link_rounded,
                        color: AppColors.teal, size: 16),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(block['label'] ?? block['url'] ?? '',
                          style: const TextStyle(
                              color: AppColors.teal,
                              decoration: TextDecoration.underline,
                              fontSize: 14)),
                    ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          }).toList(),
        );
      }
    } catch (_) {}

    // Plain HTML or markdown
    if (_isHtml(content)) return _HtmlText(html: content);
    return MarkdownBody(
      data: content,
      styleSheet: MarkdownStyleSheet(
        h1: const TextStyle(
            fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.navy),
        h2: const TextStyle(
            fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.navy),
        p: const TextStyle(fontSize: 15, height: 1.7),
        code: const TextStyle(
            backgroundColor: AppColors.slate100,
            fontFamily: 'monospace',
            fontSize: 13),
      ),
    );
  }

  dynamic _parseJson(String s) {
    // Simple JSON array parse
    try {
      return (s.startsWith('['))
          ? List<dynamic>.from(
              s.replaceAll(RegExp(r'^\[|\]$'), '').split('},').map((e) => {}))
          : [];
    } catch (_) {
      return [];
    }
  }
}

// Simple HTML renderer using RichText
class _HtmlText extends StatelessWidget {
  final String html;
  const _HtmlText({required this.html});

  @override
  Widget build(BuildContext context) {
    // Strip basic HTML tags for display
    final text = html
        .replaceAll(RegExp(r'<br\s*/?>'), '\n')
        .replaceAll(RegExp(r'<[^>]+>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
    return Text(text, style: const TextStyle(fontSize: 15, height: 1.7));
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.slate100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.slate500),
          const SizedBox(width: 5),
          Text(label,
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.slate600)),
        ],
      ),
    );
  }
}
