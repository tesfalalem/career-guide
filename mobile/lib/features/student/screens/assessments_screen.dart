import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/models/course_model.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/student_providers.dart';

class AssessmentsScreen extends ConsumerStatefulWidget {
  const AssessmentsScreen({super.key});

  @override
  ConsumerState<AssessmentsScreen> createState() => _AssessmentsScreenState();
}

class _AssessmentsScreenState extends ConsumerState<AssessmentsScreen> {
  bool _isGenerating = false;

  @override
  Widget build(BuildContext context) {
    final assessmentsAsync = ref.watch(studentAssessmentsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'Assessments'),
      body: Stack(
        children: [
          assessmentsAsync.when(
            loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.teal)),
            error: (_, __) => const Center(
                child: Text('Failed to load assessments',
                    style: TextStyle(color: AppColors.slate400))),
            data: (assessments) => assessments.isEmpty
                ? Center(
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: AppColors.teal.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: const Icon(Icons.quiz_outlined,
                                  size: 40, color: AppColors.teal),
                            ),
                            const SizedBox(height: 20),
                            const Text('No Assessments Yet',
                                style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 18,
                                    color: AppColors.slate700)),
                            const SizedBox(height: 8),
                            const Text(
                                'Enroll in a course and tap the button below to generate an AI assessment.',
                                style: TextStyle(
                                    color: AppColors.slate400, fontSize: 13),
                                textAlign: TextAlign.center),
                          ],
                        ),
                      ),
                    ),
                  )
                : RefreshIndicator(
                    color: AppColors.teal,
                    onRefresh: () => ref.refresh(studentAssessmentsProvider.future),
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                      itemCount: assessments.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, i) =>
                          _AssessmentCard(assessment: assessments[i]),
                    ),
                  ),
          ),
          if (_isGenerating)
            Container(
              color: Colors.black.withOpacity(0.4),
              child: Center(
                child: Card(
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24)),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 36, horizontal: 24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(
                          color: AppColors.teal,
                          strokeWidth: 3,
                        ),
                        SizedBox(height: 24),
                        Text(
                          'AI is architecting assessment...',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.navy,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Drafting high-fidelity questions and detailed option explanations.',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.slate400,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isGenerating ? null : () => _showGenerateBottomSheet(context),
        backgroundColor: AppColors.teal,
        elevation: 4,
        icon: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
        label: const Text(
          'Generate AI Quiz',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 13,
            color: Colors.white,
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }

  void _showGenerateBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return _GenerateQuizBottomSheet(
          onGenerate: (course, numQuestions) {
            Navigator.pop(context);
            _handleGenerate(course, numQuestions);
          },
        );
      },
    );
  }

  Future<void> _handleGenerate(CourseModel course, int numQuestions) async {
    setState(() => _isGenerating = true);
    final api = ref.read(apiClientProvider);

    try {
      // 1. Prepare course context for AI
      final courseContext = """
        Course: ${course.title}
        Description: ${course.description}
        Structure:
        ${course.modules.asMap().entries.map((mEntry) {
        final mIdx = mEntry.key;
        final m = mEntry.value;
        return "Module ${mIdx + 1}: ${m.title}\n${m.lessons.map((l) => '- ${l.title}').join('\n')}";
      }).join('\n')}
      """;

      // 2. Request AI to generate assessment
      final aiRes = await api.post(
        '/ai/generate-assessment',
        data: {
          'course_title': course.title,
          'course_content': courseContext,
          'question_count': numQuestions,
        },
      );

      final assessmentData = aiRes.data;
      if (assessmentData == null || assessmentData['error'] != null) {
        throw Exception(assessmentData?['error'] ?? 'AI Generation failed');
      }

      // 3. Save assessment to database
      final saveRes = await api.post(
        '/assessments',
        data: {
          'course_id': course.id,
          'title': assessmentData['title'] ?? 'Assessment for ${course.title}',
          'description': assessmentData['description'] ?? 'A comprehensive quiz.',
          'questions': assessmentData['questions'],
        },
      );

      final saveResult = saveRes.data;
      if (saveResult == null || saveResult['error'] != null) {
        throw Exception(saveResult?['error'] ?? 'Failed to save assessment');
      }

      // Refresh list
      ref.invalidate(studentAssessmentsProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'AI Assessment generated successfully!',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.teal,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Generation failed: ${e.toString().replaceAll('Exception:', '')}',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isGenerating = false);
      }
    }
  }
}

class _GenerateQuizBottomSheet extends ConsumerStatefulWidget {
  final void Function(CourseModel course, int numQuestions) onGenerate;
  const _GenerateQuizBottomSheet({required this.onGenerate});

  @override
  ConsumerState<_GenerateQuizBottomSheet> createState() =>
      _GenerateQuizBottomSheetState();
}

class _GenerateQuizBottomSheetState extends ConsumerState<_GenerateQuizBottomSheet> {
  CourseModel? _selectedCourse;
  int _numQuestions = 5;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final enrolledCoursesAsync = ref.watch(enrolledCoursesProvider);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, -4),
          )
        ],
      ),
      padding: EdgeInsets.fromLTRB(
          24, 16, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 48,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? AppColors.slate800 : AppColors.slate100,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.teal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.auto_awesome_rounded,
                    color: AppColors.teal, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI Assessment Builder',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.navy,
                      ),
                    ),
                    Text(
                      'Let AI compile high-fidelity test questions for you.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.slate400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          enrolledCoursesAsync.when(
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 30),
                child: CircularProgressIndicator(color: AppColors.teal),
              ),
            ),
            error: (_, __) => const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 30),
                child: Text('Failed to load enrolled courses',
                    style: TextStyle(color: AppColors.slate400)),
              ),
            ),
            data: (courses) {
              if (courses.isEmpty) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Column(
                    children: [
                      Icon(Icons.school_outlined,
                          size: 40, color: AppColors.slate300),
                      const SizedBox(height: 12),
                      const Text(
                        'No Enrolled Courses Found',
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppColors.slate600),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Enroll in a course first to generate an assessment.',
                        style: TextStyle(fontSize: 11, color: AppColors.slate400),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                );
              }

              // Auto-select first course
              if (_selectedCourse == null && courses.isNotEmpty) {
                _selectedCourse = courses.first;
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SELECT COURSE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppColors.slate400,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<CourseModel>(
                    value: _selectedCourse,
                    isExpanded: true,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: isDark ? AppColors.slate950 : AppColors.slate50,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(
                          color: isDark ? AppColors.slate800 : AppColors.slate200,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(
                          color: isDark ? AppColors.slate800 : AppColors.slate100,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                    items: courses.map((course) {
                      return DropdownMenuItem<CourseModel>(
                        value: course,
                        child: Text(
                          course.title,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedCourse = val),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'NUMBER OF QUESTIONS',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppColors.slate400,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        '$_numQuestions Qs',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.teal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Slider(
                    value: _numQuestions.toDouble(),
                    min: 3,
                    max: 15,
                    divisions: 12,
                    activeColor: AppColors.teal,
                    inactiveColor: isDark ? AppColors.slate800 : AppColors.slate100,
                    onChanged: (val) => setState(() => _numQuestions = val.round()),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _selectedCourse == null
                          ? null
                          : () => widget.onGenerate(
                              _selectedCourse!, _numQuestions),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.teal,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: const Icon(Icons.auto_awesome_rounded,
                          color: Colors.white, size: 16),
                      label: const Text(
                        'Generate Quiz Now',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _AssessmentCard extends StatelessWidget {
  final Map<String, dynamic> assessment;
  const _AssessmentCard({required this.assessment});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lastScore = assessment['last_score'];
    final passed = lastScore != null && lastScore >= 70;
    final attemptCount = assessment['attempt_count'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
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
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.navy.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.quiz_rounded,
                    color: AppColors.navy, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(assessment['title'] ?? '',
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 15),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 3),
                    Text(assessment['course_title'] ?? '',
                        style: const TextStyle(
                            color: AppColors.slate400, fontSize: 12)),
                  ],
                ),
              ),
              if (lastScore != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: (passed ? AppColors.success : AppColors.error)
                        .withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text('$lastScore%',
                      style: TextStyle(
                          color: passed ? AppColors.success : AppColors.error,
                          fontWeight: FontWeight.w800,
                          fontSize: 12)),
                ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _MetaChip(
                  icon: Icons.access_time_rounded,
                  label: '${assessment['time_limit']} min'),
              const SizedBox(width: 8),
              _MetaChip(
                  icon: Icons.help_outline_rounded,
                  label: '${assessment['question_count']} questions'),
              if (attemptCount > 0) ...[
                const SizedBox(width: 8),
                _MetaChip(
                    icon: Icons.replay_rounded,
                    label:
                        '$attemptCount attempt${attemptCount > 1 ? 's' : ''}'),
              ],
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.push(
                '/student/assessments/${assessment['id']}',
                extra: {'title': assessment['title']},
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.teal,
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              child: Text(
                attemptCount > 0 ? 'Retake Assessment' : 'Start Assessment',
                style:
                    const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate950 : AppColors.slate100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.slate500),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.slate400 : AppColors.slate600)),
        ],
      ),
    );
  }
}
