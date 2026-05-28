import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';

final _teacherStudentsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.teacherStudents);
  final list = res.data['students'] as List? ?? [];
  return list.map((s) => Map<String, dynamic>.from(s)).toList();
});

class TeacherStudentsScreen extends ConsumerWidget {
  const TeacherStudentsScreen({super.key});

  Color _getRiskColor(String? risk) {
    switch (risk) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return AppColors.warning;
      case 'low':
        return AppColors.success;
      default:
        return AppColors.slate400;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentsAsync = ref.watch(_teacherStudentsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(title: 'My Students'),
      body: RefreshIndicator(
        color: AppColors.teacherTeal,
        onRefresh: () => ref.refresh(_teacherStudentsProvider.future),
        child: studentsAsync.when(
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.teacherTeal)),
          error: (e, _) => Center(child: Text('Error: $e')),
          data: (students) => students.isEmpty
              ? const Center(
                  child: Text('No students yet',
                      style: TextStyle(color: AppColors.slate400)))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: students.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final s = students[i];
                    final progress =
                        int.tryParse(s['progress']?.toString() ?? '0') ?? 0;
                    final engagement =
                        int.tryParse(s['engagement_score']?.toString() ?? '0') ?? 0;
                    final risk = s['risk_level'] as String? ?? 'low';

                    return GestureDetector(
                      onTap: () => context.push('/teacher/students/${s['student_id']}'),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.slate900 : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: isDark
                                  ? AppColors.slate800
                                  : AppColors.slate100),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: AppColors.teacherTeal,
                              child: Text(
                                (s['student_name'] as String? ?? '?')[0].toUpperCase(),
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s['student_name'] ?? '',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14)),
                                  Text(s['course_title'] ?? '',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.slate400)),
                                  const SizedBox(height: 8),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: progress / 100,
                                      backgroundColor: isDark
                                          ? AppColors.slate800
                                          : AppColors.slate100,
                                      valueColor:
                                          const AlwaysStoppedAnimation<Color>(
                                              AppColors.teacherTeal),
                                      minHeight: 5,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: _getRiskColor(risk).withOpacity(0.1),
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                        child: Text(
                                          '${risk.toUpperCase()} RISK',
                                          style: TextStyle(
                                              color: _getRiskColor(risk),
                                              fontSize: 9,
                                              fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Icon(Icons.bolt_rounded,
                                          size: 14, color: AppColors.warning),
                                      const SizedBox(width: 2),
                                      Text(
                                        'Engagement: $engagement',
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.slate400,
                                            fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('$progress%',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 15,
                                        color: AppColors.teacherTeal)),
                                const SizedBox(height: 2),
                                const Text('Progress',
                                    style: TextStyle(
                                        fontSize: 9,
                                        color: AppColors.slate400,
                                        fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }
}
