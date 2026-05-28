import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_text_field.dart';

final studentProgressDetailsProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.baseUrl}/teacher/students/$id/progress');
  return Map<String, dynamic>.from(res.data);
});

final studentFeedbackHistoryProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((ref, id) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.baseUrl}/teacher/feedback/$id');
  final list = res.data['feedback'] as List? ?? [];
  return list.map((f) => Map<String, dynamic>.from(f)).toList();
});

class TeacherStudentDetailScreen extends ConsumerStatefulWidget {
  final String studentId;
  const TeacherStudentDetailScreen({super.key, required this.studentId});

  @override
  ConsumerState<TeacherStudentDetailScreen> createState() =>
      _TeacherStudentDetailScreenState();
}

class _TeacherStudentDetailScreenState
    extends ConsumerState<TeacherStudentDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

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

  void _showFeedbackDialog(BuildContext context) {
    final subjectCtrl = TextEditingController();
    final msgCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        bool sending = false;
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Send Feedback', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppTextField(
                    controller: subjectCtrl,
                    label: 'Subject',
                    hint: 'e.g. Keep up the good work!',
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: msgCtrl,
                    label: 'Message',
                    hint: 'Write your feedback here...',
                    maxLines: 4,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: sending ? null : () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.slate500)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.teacherTeal),
                  onPressed: sending
                      ? null
                      : () async {
                          if (subjectCtrl.text.isEmpty || msgCtrl.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Both fields are required')),
                            );
                            return;
                          }

                          setState(() => sending = true);
                          final scaffoldMessenger = ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);
                          try {
                            final api = ref.read(apiClientProvider);
                            await api.post(
                              '${ApiConstants.baseUrl}/teacher/feedback',
                              data: {
                                'to_user_id': widget.studentId,
                                'subject': subjectCtrl.text,
                                'message': msgCtrl.text,
                              },
                            );

                            scaffoldMessenger.showSnackBar(
                              const SnackBar(content: Text('Feedback sent successfully')),
                            );
                            ref.invalidate(studentFeedbackHistoryProvider(widget.studentId));
                            navigator.pop();
                          } catch (e) {
                            scaffoldMessenger.showSnackBar(
                              SnackBar(
                                  content: Text('Failed to send feedback: $e'),
                                  backgroundColor: AppColors.error),
                            );
                          } finally {
                            setState(() => sending = false);
                          }
                        },
                  child: sending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Send', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final progressAsync = ref.watch(studentProgressDetailsProvider(widget.studentId));
    final feedbackAsync = ref.watch(studentFeedbackHistoryProvider(widget.studentId));
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.navy,
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: progressAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.teacherTeal)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final student = data['student'] as Map? ?? {};
          final progressList = data['progress'] as List? ?? [];
          final metrics = data['metrics'] as Map? ?? {};
          final activity = data['recent_activity'] as List? ?? [];

          final risk = metrics['risk_level'] as String? ?? 'low';
          final engagement = metrics['engagement_score'] ?? 0;
          final timeSpent = metrics['total_time_spent'] ?? 0;

          return NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) => [
              SliverToBoxAdapter(
                child: Container(
                  color: AppColors.navy,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: AppColors.teacherTeal,
                        child: Text(
                          (student['name'] as String? ?? '?')[0].toUpperCase(),
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w800),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        student['name'] ?? '',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w700),
                      ),
                      Text(
                        student['email'] ?? '',
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _MetricChip(
                            label: 'RISK LEVEL',
                            value: risk.toUpperCase(),
                            color: _getRiskColor(risk),
                          ),
                          _MetricChip(
                            label: 'ENGAGEMENT',
                            value: '$engagement',
                            color: AppColors.warning,
                          ),
                          _MetricChip(
                            label: 'TIME SPENT',
                            value: '${timeSpent}m',
                            color: AppColors.teacherTeal,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverAppBarDelegate(
                  TabBar(
                    controller: _tabController,
                    labelColor: isDark ? Colors.white : AppColors.navy,
                    unselectedLabelColor: AppColors.slate400,
                    indicatorColor: AppColors.teacherTeal,
                    indicatorWeight: 3,
                    tabs: const [
                      Tab(text: 'Progress'),
                      Tab(text: 'Feedback'),
                    ],
                  ),
                  isDark ? AppColors.slate900 : Colors.white,
                ),
              ),
            ],
            body: TabBarView(
              controller: _tabController,
              children: [
                // ── PROGRESS TAB ──
                RefreshIndicator(
                  color: AppColors.teacherTeal,
                  onRefresh: () => ref.refresh(studentProgressDetailsProvider(widget.studentId).future),
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      const Text(
                        'Assigned Content Progress',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 10),
                      if (progressList.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Text(
                            'No assigned content tracking found.',
                            style: TextStyle(color: AppColors.slate400),
                            textAlign: TextAlign.center,
                          ),
                        )
                      else
                        ...progressList.map((p) {
                          final pct = int.tryParse(p['progress_percentage']?.toString() ?? '0') ?? 0;
                          final isCompleted = p['status'] == 'completed' || pct >= 100;
                          final type = p['resource_type'] ?? 'Course';
                          final accessed = p['last_accessed_at'] != null
                              ? timeago.format(DateTime.parse(p['last_accessed_at']))
                              : 'never';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.slate900 : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                  color: isDark
                                      ? AppColors.slate800
                                      : AppColors.slate100),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: AppColors.teacherTeal.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(
                                    type == 'Course'
                                        ? Icons.class_rounded
                                        : Icons.description_rounded,
                                    color: AppColors.teacherTeal,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        p['resource_title'] ?? '',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 13),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          Text(
                                            type,
                                            style: const TextStyle(
                                                fontSize: 11,
                                                color: AppColors.slate400,
                                                fontWeight: FontWeight.w600),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '• Accessed $accessed',
                                            style: const TextStyle(
                                                fontSize: 11,
                                                color: AppColors.slate400),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(4),
                                        child: LinearProgressIndicator(
                                          value: pct / 100,
                                          backgroundColor: isDark
                                              ? AppColors.slate800
                                              : AppColors.slate100,
                                          valueColor:
                                              const AlwaysStoppedAnimation<Color>(
                                                  AppColors.teacherTeal),
                                          minHeight: 4,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('$pct%',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w800,
                                            color: isCompleted
                                                ? AppColors.success
                                                : AppColors.teacherTeal,
                                            fontSize: 14)),
                                    Text(
                                      isCompleted ? 'Completed' : 'Active',
                                      style: TextStyle(
                                          fontSize: 9,
                                          color: isCompleted
                                              ? AppColors.success
                                              : AppColors.slate400,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        }),
                      const SizedBox(height: 20),
                      const Text(
                        'Recent Access Activity',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 10),
                      if (activity.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Text(
                            'No recent resource access logs.',
                            style: TextStyle(color: AppColors.slate400),
                            textAlign: TextAlign.center,
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: activity.length > 8 ? 8 : activity.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (context, idx) {
                            final act = activity[idx];
                            final accessed = act['accessed_at'] != null
                                ? timeago.format(DateTime.parse(act['accessed_at']))
                                : '';
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.slate900 : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                    color: isDark
                                        ? AppColors.slate800
                                        : AppColors.slate100),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.bolt_rounded,
                                      color: AppColors.warning, size: 16),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      'Accessed "${act['resource_title'] ?? 'Resource'}" (${act['access_type'] ?? 'view'})',
                                      style: const TextStyle(fontSize: 12),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    accessed,
                                    style: const TextStyle(
                                        fontSize: 10, color: AppColors.slate400),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),

                // ── FEEDBACK TAB ──
                feedbackAsync.when(
                  loading: () => const Center(
                      child: CircularProgressIndicator(
                          color: AppColors.teacherTeal)),
                  error: (e, _) => Center(child: Text('Error: $e')),
                  data: (feedbackList) => Scaffold(
                    floatingActionButton: FloatingActionButton(
                      backgroundColor: AppColors.teacherTeal,
                      onPressed: () => _showFeedbackDialog(context),
                      child: const Icon(Icons.send_rounded, color: Colors.white),
                    ),
                    body: RefreshIndicator(
                      color: AppColors.teacherTeal,
                      onRefresh: () => ref.refresh(studentFeedbackHistoryProvider(widget.studentId).future),
                      child: feedbackList.isEmpty
                          ? const Center(
                              child: Text(
                                'No feedback history. Tap the send button to send feedback.',
                                style: TextStyle(color: AppColors.slate400),
                                textAlign: TextAlign.center,
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: feedbackList.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, i) {
                                final fb = feedbackList[i];
                                final isTeacherSender = fb['feedback_type'] == 'teacher_to_student';
                                final time = fb['created_at'] != null
                                    ? timeago.format(DateTime.parse(fb['created_at']))
                                    : '';

                                return Align(
                                  alignment: isTeacherSender
                                      ? Alignment.centerRight
                                      : Alignment.centerLeft,
                                  child: Container(
                                    width: MediaQuery.of(context).size.width * 0.75,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isTeacherSender
                                          ? AppColors.teacherTeal.withOpacity(0.12)
                                          : (isDark
                                              ? AppColors.slate800
                                              : AppColors.slate100),
                                      borderRadius: BorderRadius.only(
                                        topLeft: const Radius.circular(16),
                                        topRight: const Radius.circular(16),
                                        bottomLeft: Radius.circular(isTeacherSender ? 16 : 0),
                                        bottomRight: Radius.circular(isTeacherSender ? 0 : 16),
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              fb['subject'] ?? 'Feedback',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                  color: isTeacherSender
                                                      ? AppColors.teacherTeal
                                                      : (isDark ? Colors.white : AppColors.navy)),
                                            ),
                                            Text(
                                              time,
                                              style: const TextStyle(
                                                  fontSize: 9,
                                                  color: AppColors.slate400),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          fb['message'] ?? '',
                                          style: const TextStyle(fontSize: 13),
                                        ),
                                        const SizedBox(height: 4),
                                        Align(
                                          alignment: Alignment.bottomRight,
                                          child: Text(
                                            isTeacherSender ? 'Sent by you' : 'From Student',
                                            style: const TextStyle(
                                                fontSize: 9,
                                                color: AppColors.slate400,
                                                fontWeight: FontWeight.w500),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _MetricChip(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
                color: color, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 0.5),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
                color: color, fontSize: 13, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  final Color backgroundColor;

  _SliverAppBarDelegate(this.tabBar, this.backgroundColor);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: backgroundColor,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}
