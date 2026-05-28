import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/gradient_card.dart';

final _bitAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.bitAnalytics);
    return Map<String, dynamic>.from(res.data);
  } catch (_) {
    return {};
  }
});

class BitHomeScreen extends ConsumerWidget {
  const BitHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final analyticsAsync = ref.watch(_bitAnalyticsProvider);

    return Scaffold(
      appBar: AppHeader(title: 'BiT Portal', showLogo: true),
      body: RefreshIndicator(
        color: AppColors.bitSky,
        onRefresh: () => ref.refresh(_bitAnalyticsProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            GradientCard(
              badge: 'BIT ACADEMIC PORTAL',
              title: 'Hello, ${user?.firstName ?? 'BiT'} 👋',
              subtitle: 'Manage academic content',
              colors: const [AppColors.navy, AppColors.bitSky],
              trailing: const Icon(Icons.account_balance_rounded,
                  color: Colors.white30, size: 44),
            ),
            const SizedBox(height: 24),
            analyticsAsync.when(
              loading: () => _shimmerGrid(),
              error: (_, __) => const SizedBox.shrink(),
              data: (data) => GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
                children: [
                  InfoCard(
                      label: 'Roadmaps',
                      value: '${data['total_roadmaps'] ?? 0}',
                      icon: Icons.map_rounded,
                      color: AppColors.bitSky),
                  InfoCard(
                      label: 'Published',
                      value: '${data['published_roadmaps'] ?? 0}',
                      icon: Icons.public_rounded,
                      color: AppColors.success),
                  InfoCard(
                      label: 'Courses',
                      value: '${data['total_courses'] ?? 0}',
                      icon: Icons.book_rounded,
                      color: AppColors.navy),
                  InfoCard(
                      label: 'Students',
                      value: '${data['total_students'] ?? 0}',
                      icon: Icons.people_rounded,
                      color: AppColors.teal),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => context.go('/bit/roadmaps'),
                    icon: const Icon(Icons.map_rounded, size: 18),
                    label: const Text('Roadmaps'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.bitSky,
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/bit/courses'),
                    icon: const Icon(Icons.book_rounded, size: 18),
                    label: const Text('Courses'),
                    style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.bitSky,
                        side: const BorderSide(color: AppColors.bitSky),
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmerGrid() {
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
                    borderRadius: BorderRadius.circular(20)),
              )),
    );
  }
}
