import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/student_providers.dart';
import '../../../core/models/roadmap_model.dart';

String _stripHtml(String html) {
  if (html.isEmpty) return html;
  return html
      .replaceAll(RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
      .replaceAll(RegExp(r'<[^>]+>'), '')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll(RegExp(r'\n{3,}'), '\n\n')
      .trim();
}

final _filterProvider = StateProvider<Map<String, String>>((ref) => {});
final _searchProvider = StateProvider<String>((ref) => '');

class RoadmapsScreen extends ConsumerWidget {
  const RoadmapsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(_filterProvider);
    final search = ref.watch(_searchProvider);
    final roadmapsAsync = ref.watch(curatedRoadmapsProvider(filters));

    return Scaffold(
      appBar: AppHeader(title: 'Career Roadmaps'),
      body: Column(
        children: [
          // ── Search ──────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              onChanged: (v) => ref.read(_searchProvider.notifier).state = v,
              decoration: InputDecoration(
                hintText: 'Search roadmaps...',
                prefixIcon: const Icon(Icons.search_rounded,
                    color: AppColors.slate400, size: 20),
                suffixIcon: search.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded,
                            color: AppColors.slate400, size: 18),
                        onPressed: () =>
                            ref.read(_searchProvider.notifier).state = '',
                      )
                    : null,
              ),
            ),
          ),

          // ── Filter chips ─────────────────────────────────────────────────
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children:
                  ['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) {
                final selected = level == 'All'
                    ? !filters.containsKey('difficulty_level')
                    : filters['difficulty_level'] == level.toLowerCase();
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    child: GestureDetector(
                      onTap: () {
                        ref.read(_filterProvider.notifier).state =
                            level == 'All'
                                ? {}
                                : {'difficulty_level': level.toLowerCase()};
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: selected
                              ? AppColors.teal
                              : Theme.of(context).cardTheme.color,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color:
                                selected ? AppColors.teal : AppColors.slate200,
                          ),
                        ),
                        child: Text(
                          level,
                          style: TextStyle(
                            color: selected ? Colors.white : AppColors.slate500,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // ── List ─────────────────────────────────────────────────────────
          Expanded(
            child: roadmapsAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.teal)),
              error: (e, _) => _ErrorState(message: 'Failed to load roadmaps'),
              data: (roadmaps) {
                final filtered = search.isEmpty
                    ? roadmaps
                    : roadmaps
                        .where((r) =>
                            r.title
                                .toLowerCase()
                                .contains(search.toLowerCase()) ||
                            r.category
                                .toLowerCase()
                                .contains(search.toLowerCase()))
                        .toList();

                if (filtered.isEmpty) {
                  return const _EmptyState(
                    icon: Icons.map_outlined,
                    title: 'No roadmaps found',
                    subtitle: 'Try a different search or filter',
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) =>
                      _RoadmapCard(roadmap: filtered[i]),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/student/roadmaps/generate'),
        backgroundColor: AppColors.teal,
        icon: const Icon(Icons.psychology_rounded, color: Colors.white),
        label: const Text(
          'AI Custom Roadmap',
          style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
        ),
      ),
    );
  }
}

class _RoadmapCard extends StatelessWidget {
  final CuratedRoadmapModel roadmap;
  const _RoadmapCard({required this.roadmap});

  Color get _diffColor {
    switch (roadmap.difficultyLevel) {
      case 'beginner':
        return AppColors.success;
      case 'intermediate':
        return AppColors.warning;
      case 'advanced':
        return AppColors.error;
      default:
        return AppColors.slate400;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () => context.push('/student/roadmaps/${roadmap.id}'),
      child: Container(
        padding: const EdgeInsets.all(18),
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
                _Chip(label: roadmap.category, color: AppColors.teal),
                const Spacer(),
                _Chip(label: roadmap.difficultyLevel, color: _diffColor),
              ],
            ),
            const SizedBox(height: 12),
            Text(roadmap.title,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w800),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
            if (roadmap.description.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(_stripHtml(roadmap.description),
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 14),
            Row(
              children: [
                _MetaItem(
                    icon: Icons.access_time_rounded,
                    label: roadmap.estimatedDuration),
                const SizedBox(width: 14),
                _MetaItem(
                    icon: Icons.people_outline_rounded,
                    label: '${roadmap.enrollments} enrolled'),
                const SizedBox(width: 14),
                _MetaItem(
                    icon: Icons.layers_rounded,
                    label: '${roadmap.phases.length} phases'),
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

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }
}

class _MetaItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MetaItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.slate400),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(
                fontSize: 11,
                color: AppColors.slate400,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _EmptyState(
      {required this.icon, required this.title, required this.subtitle});

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
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  const _ErrorState({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline_rounded,
              size: 48, color: AppColors.error),
          const SizedBox(height: 12),
          Text(message,
              style: const TextStyle(color: AppColors.slate500, fontSize: 14)),
        ],
      ),
    );
  }
}
