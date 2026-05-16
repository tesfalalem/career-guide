import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/student_providers.dart';

class AssessmentsScreen extends ConsumerWidget {
  const AssessmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final assessmentsAsync = ref.watch(studentAssessmentsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'Assessments'),
      body: assessmentsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.teal)),
        error: (_, __) => const Center(
            child: Text('Failed to load assessments',
                style: TextStyle(color: AppColors.slate400))),
        data: (assessments) => assessments.isEmpty
            ? Center(
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
                          'Enroll in a course to unlock skill assessments',
                          style: TextStyle(
                              color: AppColors.slate400, fontSize: 13),
                          textAlign: TextAlign.center),
                    ],
                  ),
                ),
              )
            : RefreshIndicator(
                color: AppColors.teal,
                onRefresh: () => ref.refresh(studentAssessmentsProvider.future),
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: assessments.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) =>
                      _AssessmentCard(assessment: assessments[i]),
                ),
              ),
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
                    const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.slate100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.slate500),
          const SizedBox(width: 4),
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
