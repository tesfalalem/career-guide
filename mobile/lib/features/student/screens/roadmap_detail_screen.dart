import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../providers/student_providers.dart';

/// Strip HTML tags and decode common HTML entities for plain text display
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
      .replaceAll('&#39;', "'")
      .replaceAll(RegExp(r'\n{3,}'), '\n\n')
      .trim();
}

class RoadmapDetailScreen extends ConsumerStatefulWidget {
  final String id;
  const RoadmapDetailScreen({super.key, required this.id});

  @override
  ConsumerState<RoadmapDetailScreen> createState() =>
      _RoadmapDetailScreenState();
}

class _RoadmapDetailScreenState extends ConsumerState<RoadmapDetailScreen> {
  bool _enrolling = false;
  bool _enrolled = false;
  String? _enrollMsg;
  bool _enrollError = false;
  final Set<int> _expanded = {0};

  Future<void> _enroll() async {
    setState(() {
      _enrolling = true;
      _enrollMsg = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      // Accept 409 (already enrolled) as a valid response — don't throw
      final response = await api.post(
        '${ApiConstants.curatedRoadmaps}/${widget.id}/enroll',
        options:
            Options(validateStatus: (status) => status != null && status < 500),
      );
      final alreadyEnrolled = response.statusCode == 409;
      setState(() {
        _enrolled = true;
        _enrollError = false;
        _enrollMsg = alreadyEnrolled
            ? 'You are already enrolled in this path.'
            : 'Successfully enrolled! Start learning now.';
      });
    } catch (e) {
      setState(() {
        _enrolled = false;
        _enrollError = true;
        _enrollMsg = 'Enrollment failed. Please try again.';
      });
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final roadmapAsync = ref.watch(roadmapDetailProvider(widget.id));

    return Scaffold(
      body: roadmapAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.teal)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (roadmap) => CustomScrollView(
          slivers: [
            // ── Hero app bar ─────────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 200,
              pinned: true,
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              iconTheme: const IconThemeData(color: Colors.white),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.navy, Color(0xFF0369A1)],
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
                          Row(
                            children: [
                              _Chip(
                                  label: roadmap.category,
                                  color: Colors.white.withOpacity(0.2),
                                  textColor: Colors.white),
                              const SizedBox(width: 8),
                              _Chip(
                                  label: roadmap.difficultyLevel,
                                  color: Colors.white.withOpacity(0.15),
                                  textColor: Colors.white70),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(roadmap.title,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
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
                  // ── Meta row ───────────────────────────────────────────
                  Row(
                    children: [
                      _MetaItem(
                          icon: Icons.access_time_rounded,
                          label: roadmap.estimatedDuration),
                      const SizedBox(width: 14),
                      _MetaItem(
                          icon: Icons.layers_rounded,
                          label: '${roadmap.phases.length} phases'),
                      const SizedBox(width: 14),
                      _MetaItem(
                          icon: Icons.people_outline_rounded,
                          label: '${roadmap.enrollments} enrolled'),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // ── Description ────────────────────────────────────────
                  if (roadmap.description.isNotEmpty)
                    Text(_stripHtml(roadmap.description),
                        style: Theme.of(context)
                            .textTheme
                            .bodyLarge
                            ?.copyWith(height: 1.6, color: AppColors.slate600)),

                  // ── Enroll feedback ────────────────────────────────────
                  if (_enrollMsg != null) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (_enrollError
                                ? AppColors.warning
                                : AppColors.success)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: (_enrollError
                                  ? AppColors.warning
                                  : AppColors.success)
                              .withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _enrollError
                                ? Icons.info_outline_rounded
                                : Icons.check_circle_rounded,
                            color: _enrollError
                                ? AppColors.warning
                                : AppColors.success,
                            size: 18,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(_enrollMsg!,
                                style: TextStyle(
                                    color: _enrollError
                                        ? AppColors.warning
                                        : AppColors.success,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13)),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // ── Enroll button ──────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _enrolled ? null : _enroll,
                      icon: _enrolling
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2))
                          : Icon(_enrolled
                              ? Icons.check_circle_rounded
                              : Icons.play_arrow_rounded),
                      label: Text(_enrolled
                          ? 'Enrolled'
                          : _enrolling
                              ? 'Enrolling...'
                              : 'Start This Path'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            _enrolled ? AppColors.success : AppColors.navy,
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Phases ─────────────────────────────────────────────
                  Text('Learning Phases',
                      style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 16),

                  ...roadmap.phases.asMap().entries.map((entry) {
                    final i = entry.key;
                    final phase = entry.value;
                    final isExpanded = _expanded.contains(i);
                    final isDark =
                        Theme.of(context).brightness == Brightness.dark;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.slate900 : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isExpanded
                              ? AppColors.teal.withOpacity(0.4)
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
                                _expanded.remove(i);
                              else
                                _expanded.add(i);
                            }),
                            leading: CircleAvatar(
                              backgroundColor: isExpanded
                                  ? AppColors.teal
                                  : AppColors.slate100,
                              radius: 18,
                              child: Text('${i + 1}',
                                  style: TextStyle(
                                    color: isExpanded
                                        ? Colors.white
                                        : AppColors.slate500,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                  )),
                            ),
                            title: Text(phase.title,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 14)),
                            subtitle: Text(phase.duration,
                                style: const TextStyle(
                                    fontSize: 12, color: AppColors.slate400)),
                            trailing: AnimatedRotation(
                              turns: isExpanded ? 0.5 : 0,
                              duration: const Duration(milliseconds: 200),
                              child: const Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  color: AppColors.slate400),
                            ),
                          ),
                          if (isExpanded) ...[
                            const Divider(height: 1),
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (phase.description.isNotEmpty)
                                    Text(_stripHtml(phase.description),
                                        style: const TextStyle(
                                            fontSize: 13,
                                            color: AppColors.slate500,
                                            height: 1.5)),
                                  if (phase.topics.isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    ...phase.topics.map((topic) => Padding(
                                          padding:
                                              const EdgeInsets.only(bottom: 8),
                                          child: Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                width: 6,
                                                height: 6,
                                                margin: const EdgeInsets.only(
                                                    top: 5, right: 10),
                                                decoration: const BoxDecoration(
                                                  color: AppColors.teal,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                              Expanded(
                                                child: Text(topic.title,
                                                    style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        fontSize: 13)),
                                              ),
                                            ],
                                          ),
                                        )),
                                  ],
                                ],
                              ),
                            ),
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
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  final Color textColor;
  const _Chip(
      {required this.label, required this.color, required this.textColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              color: textColor, fontSize: 10, fontWeight: FontWeight.w700)),
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
        Icon(icon, size: 14, color: AppColors.slate400),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                color: AppColors.slate400,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}
