import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

final _bitCoursesProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.bitCourses);
  final list = res.data as List? ?? [];
  return list.map((c) => Map<String, dynamic>.from(c)).toList();
});

class BitCoursesScreen extends ConsumerWidget {
  const BitCoursesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(_bitCoursesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Courses')),
      body: coursesAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.bitSky)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (courses) => courses.isEmpty
            ? const Center(
                child: Text('No courses yet',
                    style: TextStyle(color: AppColors.slate400)))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: courses.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final c = courses[i];
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardTheme.color,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.slate100),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.navy.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.book_rounded,
                              color: AppColors.navy, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(c['title'] ?? '',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis),
                              Text(
                                  '${c['level'] ?? ''} · ${c['category'] ?? ''}',
                                  style: const TextStyle(
                                      fontSize: 12, color: AppColors.slate400)),
                            ],
                          ),
                        ),
                        Text('${c['enrolled_count'] ?? 0} enrolled',
                            style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.bitSky,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
