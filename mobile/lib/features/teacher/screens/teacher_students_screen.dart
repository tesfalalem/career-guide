import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';

final _teacherStudentsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.teacherStudents);
  final list = res.data as List? ?? [];
  return list.map((s) => Map<String, dynamic>.from(s)).toList();
});

class TeacherStudentsScreen extends ConsumerWidget {
  const TeacherStudentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentsAsync = ref.watch(_teacherStudentsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'My Students'),
      body: studentsAsync.when(
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
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final s = students[i];
                  final progress =
                      int.tryParse(s['progress']?.toString() ?? '0') ?? 0;
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardTheme.color,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.slate100),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: AppColors.teacherTeal,
                          child: Text(
                            (s['name'] as String? ?? '?')[0].toUpperCase(),
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
                              Text(s['name'] ?? '',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700)),
                              Text(s['course_title'] ?? '',
                                  style: const TextStyle(
                                      fontSize: 12, color: AppColors.slate400)),
                              const SizedBox(height: 6),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: progress / 100,
                                  backgroundColor: AppColors.slate100,
                                  valueColor:
                                      const AlwaysStoppedAnimation<Color>(
                                          AppColors.teacherTeal),
                                  minHeight: 5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text('$progress%',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AppColors.teacherTeal)),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
