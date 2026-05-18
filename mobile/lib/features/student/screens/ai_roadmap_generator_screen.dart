import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/ai_roadmap_model.dart';
import '../../../core/models/course_model.dart';
import '../providers/student_providers.dart';

class AiRoadmapGeneratorScreen extends ConsumerStatefulWidget {
  const AiRoadmapGeneratorScreen({super.key});

  @override
  ConsumerState<AiRoadmapGeneratorScreen> createState() =>
      _AiRoadmapGeneratorScreenState();
}

class _AiRoadmapGeneratorScreenState
    extends ConsumerState<AiRoadmapGeneratorScreen> {
  final TextEditingController _inputController = TextEditingController();
  
  bool _isLoading = false;
  bool _isCreatingCourse = false;
  
  AiRoadmapModel? _generatedRoadmap;
  String? _error;
  
  List<Map<String, dynamic>> _history = [];
  bool _loadingHistory = false;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    setState(() => _loadingHistory = true);
    final api = ref.read(apiClientProvider);
    try {
      final res = await api.get(ApiConstants.userRoadmaps);
      final data = res.data as List? ?? [];
      setState(() {
        _history = data.map((item) => Map<String, dynamic>.from(item)).toList();
      });
    } catch (_) {
      // Ignore silently or show empty history
    } finally {
      setState(() => _loadingHistory = false);
    }
  }

  Future<void> _generate(String query) async {
    if (query.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
      _error = null;
      _generatedRoadmap = null;
    });

    final api = ref.read(apiClientProvider);
    try {
      // 1. Generate roadmap
      final res = await api.post(
        ApiConstants.generateRoadmap,
        data: {'role': query},
      );
      
      final data = res.data;
      if (data == null || data['error'] != null) {
        throw Exception(data?['error'] ?? 'Failed to generate');
      }

      final roadmap = AiRoadmapModel.fromJson(data);
      setState(() {
        _generatedRoadmap = roadmap;
      });

      // 2. Save roadmap in history
      _saveRoadmap(roadmap);
    } catch (e) {
      setState(() {
        _error = 'AI Architect is busy. Please try again in a few seconds.';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveRoadmap(AiRoadmapModel roadmap) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.post(
        ApiConstants.roadmaps,
        data: {
          'title': roadmap.title,
          'role': roadmap.role,
          'road_data': roadmap.toJson(),
        },
      );
      _loadHistory(); // Reload history list
    } catch (_) {}
  }

  Future<void> _deleteHistoryItem(String id) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.delete('${ApiConstants.roadmaps}/$id');
      setState(() {
        _history.removeWhere((item) => item['id']?.toString() == id);
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Roadmap removed successfully'),
          backgroundColor: AppColors.teal,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Failed to delete roadmap'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  Future<void> _createCourse() async {
    if (_generatedRoadmap == null) return;
    setState(() => _isCreatingCourse = true);
    
    final api = ref.read(apiClientProvider);
    try {
      final res = await api.post(
        ApiConstants.generateCourse,
        data: {'role': _generatedRoadmap!.role},
      );
      
      final data = res.data;
      if (data == null || data['error'] != null) {
        throw Exception(data?['error'] ?? 'Course generation failed');
      }

      final course = CourseModel.fromJson(data);
      
      // Invalidate course providers so they load newly generated courses
      ref.invalidate(enrolledCoursesProvider);
      ref.invalidate(allCoursesProvider);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Course "${course.title}" generated successfully!'),
            backgroundColor: AppColors.teal,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        // Navigate directly to course viewer
        context.pushReplacement('/student/courses/${course.id}');
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to generate full course lessons. Try again.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      setState(() => _isCreatingCourse = false);
    }
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    try {
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw 'Could not launch $urlString';
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Unable to open link: $urlString'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _generatedRoadmap != null ? 'AI Learning Protocol' : 'AI Roadmap Generator',
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () {
            if (_generatedRoadmap != null) {
              setState(() => _generatedRoadmap = null);
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: _generatedRoadmap != null
          ? _buildRoadmapView(isDark)
          : _buildInputView(isDark),
    );
  }

  // ── 1. Input View ──────────────────────────────────────────────────────────
  Widget _buildInputView(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 20),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.teal, AppColors.adminIndigo],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppColors.teal.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: const Icon(Icons.rocket_launch_rounded,
                color: Colors.white, size: 40),
          ),
          const SizedBox(height: 24),
          const Text(
            'Master Anything.',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            'From programming to physics, AI constructs a professional learning protocol for any goal.',
            style: TextStyle(
              fontSize: 15,
              color: isDark ? AppColors.slate400 : AppColors.slate600,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          
          // Custom Search Input
          Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.slate900 : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isDark ? AppColors.slate800 : AppColors.slate200,
              ),
              boxShadow: isDark
                  ? null
                  : [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      )
                    ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                const Icon(Icons.psychology_rounded, color: AppColors.teal, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    decoration: const InputDecoration(
                      hintText: 'e.g. Flutter Developer, Cloud Architect...',
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                    onSubmitted: (val) => _generate(val),
                  ),
                ),
                GestureDetector(
                  onTap: _isLoading ? null : () => _generate(_inputController.text),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.teal,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(Icons.arrow_forward_rounded,
                            color: Colors.white, size: 20),
                  ),
                )
              ],
            ),
          ),
          
          if (_error != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: 24),
          
          // Suggestions
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: ['Launch a Startup', 'Learn Piano', 'Data Science', 'UI/UX Design'].map((tag) {
              return GestureDetector(
                onTap: () {
                  _inputController.text = tag;
                  _generate(tag);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.slate900 : Colors.white,
                    border: Border.all(
                      color: isDark ? AppColors.slate800 : AppColors.slate200,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    tag,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.slate300 : AppColors.slate600,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          
          const SizedBox(height: 48),
          
          // History
          _buildHistorySection(isDark),
        ],
      ),
    );
  }

  Widget _buildHistorySection(bool isDark) {
    if (_loadingHistory) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.teal),
      );
    }
    if (_history.isEmpty) return const SizedBox();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Previous Protocols',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.slate400, letterSpacing: 1),
            ),
            const SizedBox(width: 8),
            Expanded(child: Divider(color: isDark ? AppColors.slate800 : AppColors.slate200)),
          ],
        ),
        const SizedBox(height: 16),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _history.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, idx) {
            final item = _history[idx];
            final title = item['title'] ?? 'AI Roadmap';
            final role = item['role'] ?? '';
            final roadDataRaw = item['road_data'];
            final id = item['id']?.toString() ?? '';
            
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.slate900 : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: isDark ? AppColors.slate800 : AppColors.slate200),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        if (roadDataRaw != null) {
                          try {
                            final roadmap = AiRoadmapModel.fromJson(
                              Map<String, dynamic>.from(roadDataRaw),
                            );
                            setState(() {
                              _generatedRoadmap = roadmap;
                            });
                          } catch (_) {}
                        }
                      },
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            role,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.teal),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            title,
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? AppColors.slate400 : AppColors.slate600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 20),
                    onPressed: () => _deleteHistoryItem(id),
                  ),
                ],
              ),
            );
          },
        )
      ],
    );
  }

  // ── 2. Detailed Roadmap View ───────────────────────────────────────────────
  Widget _buildRoadmapView(bool isDark) {
    final roadmap = _generatedRoadmap!;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Summary Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.navy, AppColors.slate900],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: AppColors.navy.withOpacity(0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: const Text(
                    'AI PROTOCOL GENERATED',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  roadmap.role,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  roadmap.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.7),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ESTIMATED DURATION',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: Colors.white.withOpacity(0.4),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            '~6 Months',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PHASES COUNT',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: Colors.white.withOpacity(0.4),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${roadmap.phases.length} Phases',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Action Button: Create Full Course
          SizedBox(
            width: double.infinity,
            height: 58,
            child: ElevatedButton.icon(
              onPressed: _isCreatingCourse ? null : _createCourse,
              icon: _isCreatingCourse
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.auto_stories_rounded),
              label: Text(
                _isCreatingCourse ? 'ARCHITECTING LESSONS...' : 'CREATE FULL COURSE',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.teal,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 32),
          const Text(
            'Timeline Path',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: -0.5),
          ),
          const SizedBox(height: 16),
          
          // Timeline List of Phases
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: roadmap.phases.length,
            itemBuilder: (context, idx) {
              final phase = roadmap.phases[idx];
              return _buildPhaseCard(phase, idx + 1, isDark);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPhaseCard(AiRoadmapPhaseModel phase, int index, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isDark ? AppColors.slate800 : AppColors.slate200),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.all(16),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.teal.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '0$index',
              style: const TextStyle(
                color: AppColors.teal,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        title: Text(
          phase.title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            '${phase.duration} • ${phase.topics.length} topics',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.slate400,
            ),
          ),
        ),
        children: [
          Divider(color: isDark ? AppColors.slate800 : AppColors.slate200),
          const SizedBox(height: 8),
          Text(
            phase.description,
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppColors.slate400 : AppColors.slate600,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          
          // Topics list
          ...phase.topics.map((topic) => _buildTopicTile(topic, isDark)),
        ],
      ),
    );
  }

  Widget _buildTopicTile(AiRoadmapTopicModel topic, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate800 : AppColors.slate50,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? AppColors.slate700 : AppColors.slate100),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
        title: Text(
          topic.title,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
        ),
        leading: const Icon(Icons.bubble_chart_rounded, color: AppColors.teal, size: 20),
        children: [
          const SizedBox(height: 8),
          
          // Key Concepts tags
          const Text(
            'KEY CONCEPTS',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              color: AppColors.slate400,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: topic.concepts.map((concept) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.slate900 : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark ? AppColors.slate700 : AppColors.slate200,
                  ),
                ),
                child: Text(
                  concept,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.slate300 : AppColors.slate700,
                  ),
                ),
              );
            }).toList(),
          ),
          
          if (topic.resources.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text(
              'RECOMMENDED RESOURCES',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w900,
                color: AppColors.slate400,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            
            // Resources list
            ...topic.resources.map((res) {
              IconData rIcon = Icons.link_rounded;
              Color rColor = AppColors.teal;
              if (res.type == 'video') {
                rIcon = Icons.play_circle_outline_rounded;
                rColor = Colors.red;
              } else if (res.type == 'course') {
                rIcon = Icons.menu_book_rounded;
                rColor = AppColors.adminIndigo;
              } else if (res.type == 'documentation') {
                rIcon = Icons.description_outlined;
                rColor = Colors.blueGrey;
              }
              
              return InkWell(
                onTap: () => _launchUrl(res.url),
                borderRadius: BorderRadius.circular(10),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
                  child: Row(
                    children: [
                      Icon(rIcon, color: rColor, size: 16),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          res.title,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.slate200 : AppColors.slate800,
                            decoration: TextDecoration.underline,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.arrow_outward_rounded, size: 12, color: AppColors.slate400),
                    ],
                  ),
                ),
              );
            }),
          ]
        ],
      ),
    );
  }
}
