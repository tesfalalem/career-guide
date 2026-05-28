import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/gradient_card.dart';

final teacherAnalyticsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.baseUrl}/teacher/analytics');
  return Map<String, dynamic>.from(res.data);
});

class TeacherAnalyticsScreen extends ConsumerWidget {
  const TeacherAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analyticsAsync = ref.watch(teacherAnalyticsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(title: 'Analytics Overview'),
      body: RefreshIndicator(
        color: AppColors.teacherTeal,
        onRefresh: () => ref.refresh(teacherAnalyticsProvider.future),
        child: analyticsAsync.when(
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.teacherTeal)),
          error: (e, _) => Center(child: Text('Error: $e')),
          data: (data) {
            final resourceStats = data['resource_stats'] as Map? ?? {};
            final studentStats = data['student_stats'] as Map? ?? {};
            final topResources = data['top_resources'] as List? ?? [];
            final ratingDistribution = data['rating_distribution'] as List? ?? [];
            final monthlyActivity = data['monthly_activity'] as List? ?? [];
            final categoryPerformance = data['category_performance'] as List? ?? [];

            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // ── KPI Stats Grid ──────────────────────────────────────────
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    InfoCard(
                        label: 'Total Students',
                        value: '${studentStats['total_students'] ?? 0}',
                        icon: Icons.people_rounded,
                        color: AppColors.teacherTeal),
                    InfoCard(
                        label: 'Avg Engagement',
                        value: '${studentStats['avg_engagement'] != null ? double.parse(studentStats['avg_engagement'].toString()).toStringAsFixed(1) : 0}',
                        icon: Icons.bolt_rounded,
                        color: AppColors.warning),
                    InfoCard(
                        label: 'Total Views',
                        value: '${resourceStats['total_views'] ?? 0}',
                        icon: Icons.visibility_rounded,
                        color: AppColors.navy),
                    InfoCard(
                        label: 'Total Downloads',
                        value: '${resourceStats['total_downloads'] ?? 0}',
                        icon: Icons.download_rounded,
                        color: AppColors.success),
                  ],
                ),
                const SizedBox(height: 24),

                // ── Monthly Engagement Chart ───────────────────────────────
                _CardContainer(
                  title: 'Monthly Activity (Student Accesses)',
                  child: _buildMonthlyActivityChart(monthlyActivity, isDark),
                ),
                const SizedBox(height: 20),

                // ── Rating Distribution & Top Resources ─────────────────────
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: _CardContainer(
                        title: 'Rating Distribution',
                        child: _buildRatingDistribution(ratingDistribution, isDark),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                _CardContainer(
                  title: 'Top Performing Resources',
                  child: _buildTopResourcesList(topResources, isDark),
                ),
                const SizedBox(height: 20),

                _CardContainer(
                  title: 'Category Performance',
                  child: _buildCategoryPerformanceList(categoryPerformance, isDark),
                ),
                const SizedBox(height: 20),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildMonthlyActivityChart(List<dynamic> list, bool isDark) {
    if (list.isEmpty) {
      return const SizedBox(
        height: 140,
        child: Center(
          child: Text('No monthly activity logged yet',
              style: TextStyle(color: AppColors.slate400, fontSize: 13)),
        ),
      );
    }

    // Take last 6 months, reverse to put chronologically
    final activity = list.take(6).toList().reversed.toList();
    
    // Find max value to proportion the heights
    int maxAccesses = 1;
    for (final act in activity) {
      final accesses = int.tryParse(act['total_accesses']?.toString() ?? '0') ?? 0;
      if (accesses > maxAccesses) maxAccesses = accesses;
    }

    return SizedBox(
      height: 180,
      child: Padding(
        padding: const EdgeInsets.only(top: 20, bottom: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: activity.map((act) {
            final monthStr = act['month']?.toString() ?? '';
            // Convert "2026-05" -> "May" or "05"
            String displayMonth = monthStr;
            try {
              final parts = monthStr.split('-');
              if (parts.length == 2) {
                final m = int.parse(parts[1]);
                const months = [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                if (m >= 1 && m <= 12) displayMonth = months[m - 1];
              }
            } catch (_) {}

            final accesses = int.tryParse(act['total_accesses']?.toString() ?? '0') ?? 0;
            final proportion = accesses / maxAccesses;
            final barHeight = proportion * 110;

            return Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  '$accesses',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.teacherTeal),
                ),
                const SizedBox(height: 4),
                Container(
                  width: 24,
                  height: barHeight < 4 ? 4 : barHeight,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.teacherTeal, Color(0xFF2DD4BF)],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(6),
                      topRight: Radius.circular(6),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teacherTeal.withOpacity(0.15),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  displayMonth,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.slate400),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildRatingDistribution(List<dynamic> list, bool isDark) {
    // Map rating 5 down to 1
    final Map<int, int> counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    int totalCount = 0;
    for (final item in list) {
      final rating = int.tryParse(item['rating']?.toString() ?? '0') ?? 0;
      final count = int.tryParse(item['count']?.toString() ?? '0') ?? 0;
      if (counts.containsKey(rating)) {
        counts[rating] = count;
        totalCount += count;
      }
    }

    return Column(
      children: [5, 4, 3, 2, 1].map((rating) {
        final count = counts[rating] ?? 0;
        final proportion = totalCount > 0 ? (count / totalCount) : 0.0;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Text('$rating', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(width: 4),
              const Icon(Icons.star_rounded, color: AppColors.warning, size: 14),
              const SizedBox(width: 8),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: proportion,
                    backgroundColor: isDark ? AppColors.slate800 : AppColors.slate100,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.warning),
                    minHeight: 8,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                width: 24,
                child: Text(
                  '$count',
                  style: const TextStyle(fontSize: 12, color: AppColors.slate400, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTopResourcesList(List<dynamic> list, bool isDark) {
    if (list.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 14),
        child: Center(
          child: Text('No approved resources views logged yet',
              style: TextStyle(color: AppColors.slate400, fontSize: 13)),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length > 5 ? 5 : list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        final r = list[i];
        final views = r['views'] ?? 0;
        final dls = r['downloads'] ?? 0;
        final rating = r['avg_rating'] != null 
            ? double.parse(r['avg_rating'].toString()).toStringAsFixed(1)
            : '0.0';

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? AppColors.slate900 : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.teacherTeal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.description_rounded, color: AppColors.teacherTeal, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r['title'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      r['category'] ?? '',
                      style: const TextStyle(color: AppColors.slate400, fontSize: 11),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: AppColors.warning, size: 14),
                      const SizedBox(width: 2),
                      Text(rating, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$views views • $dls dls',
                    style: const TextStyle(color: AppColors.slate400, fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCategoryPerformanceList(List<dynamic> list, bool isDark) {
    if (list.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 14),
        child: Center(
          child: Text('No categories logged yet',
              style: TextStyle(color: AppColors.slate400, fontSize: 13)),
        ),
      );
    }

    return Column(
      children: list.map((c) {
        final count = c['resource_count'] ?? 0;
        final views = c['total_views'] ?? 0;
        final rating = c['avg_rating'] != null 
            ? double.parse(c['avg_rating'].toString()).toStringAsFixed(1)
            : '0.0';

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c['category'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '$count resources • $views total views',
                      style: const TextStyle(color: AppColors.slate400, fontSize: 11),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.star_rounded, color: AppColors.warning, size: 14),
                  const SizedBox(width: 2),
                  Text(rating, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _CardContainer extends StatelessWidget {
  final String title;
  final Widget child;
  const _CardContainer({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
