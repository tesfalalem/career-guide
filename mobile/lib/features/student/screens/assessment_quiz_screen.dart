import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';

class AssessmentQuizScreen extends ConsumerStatefulWidget {
  final int assessmentId;
  final String title;
  const AssessmentQuizScreen(
      {super.key, required this.assessmentId, required this.title});

  @override
  ConsumerState<AssessmentQuizScreen> createState() =>
      _AssessmentQuizScreenState();
}

class _AssessmentQuizScreenState extends ConsumerState<AssessmentQuizScreen> {
  List<Map<String, dynamic>> _questions = [];
  // Use String keys to match what the backend expects
  final Map<String, int> _answers = {};
  int _current = 0;
  bool _loading = true;
  bool _submitting = false;
  Map<String, dynamic>? _result;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
  }

  Future<void> _loadQuiz() async {
    try {
      final api = ref.read(apiClientProvider);
      final res =
          await api.get('${ApiConstants.assessments}/${widget.assessmentId}');
      setState(() {
        _questions =
            List<Map<String, dynamic>>.from(res.data['questions'] ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.post(
        '${ApiConstants.assessments}/${widget.assessmentId}/submit',
        data: {'answers': _answers},
      );
      if (mounted)
        setState(() => _result = Map<String, dynamic>.from(res.data));
    } catch (e) {
      if (mounted) {
        setState(() => _error =
            'Submission failed. Please check your connection and try again.');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.teal)),
      );
    }

    if (_result != null) return _ResultScreen(result: _result!);

    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppHeader(title: widget.title, showDrawerButton: false),
        body: const Center(child: Text('No questions available')),
      );
    }

    final q = _questions[_current];
    final options = List<String>.from(q['options'] ?? []);
    final total = _questions.length;
    final allAnswered =
        _questions.every((q) => _answers.containsKey(q['id'].toString()));

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, overflow: TextOverflow.ellipsis),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? AppColors.slate900
            : Colors.white,
        foregroundColor: Theme.of(context).brightness == Brightness.dark
            ? Colors.white
            : AppColors.navy,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: (_current + 1) / total,
            backgroundColor: AppColors.slate100,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.teal),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Question ${_current + 1} of $total',
              style: const TextStyle(
                  color: AppColors.slate400,
                  fontSize: 12,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            Text(
              q['question'] ?? '',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                itemCount: options.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final selected = _answers[q['id'].toString()] == i;
                  return GestureDetector(
                    onTap: () =>
                        setState(() => _answers[q['id'].toString()] = i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: selected
                            ? AppColors.teal.withOpacity(0.08)
                            : Theme.of(context).cardTheme.color,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: selected ? AppColors.teal : AppColors.slate200,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: selected
                                  ? AppColors.teal
                                  : AppColors.slate100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(
                              child: Text(
                                String.fromCharCode(65 + i),
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  color: selected
                                      ? Colors.white
                                      : AppColors.slate500,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(options[i],
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: selected ? AppColors.teal : null,
                                )),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Row(
              children: [
                if (_current > 0)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => setState(() => _current--),
                      icon: const Icon(Icons.arrow_back_rounded, size: 16),
                      label: const Text('Previous'),
                    ),
                  ),
                if (_current > 0) const SizedBox(width: 12),
                Expanded(
                  child: _current < total - 1
                      ? ElevatedButton.icon(
                          onPressed: () => setState(() => _current++),
                          icon:
                              const Icon(Icons.arrow_forward_rounded, size: 16),
                          label: const Text('Next'),
                        )
                      : ElevatedButton.icon(
                          onPressed:
                              (!allAnswered || _submitting) ? null : _submit,
                          icon: _submitting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                              : const Icon(Icons.check_rounded, size: 16),
                          label: const Text('Submit'),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.teal),
                        ),
                ),
              ],
            ),
            // Error message
            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded,
                        color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_error!,
                          style: const TextStyle(
                              color: AppColors.error,
                              fontSize: 12,
                              fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;
  const _ResultScreen({required this.result});

  @override
  Widget build(BuildContext context) {
    final passed = result['passed'] == true;
    final pct = result['percentage'] ?? 0;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: (passed ? AppColors.success : AppColors.error)
                      .withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  passed ? Icons.emoji_events_rounded : Icons.close_rounded,
                  size: 60,
                  color: passed ? AppColors.success : AppColors.error,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                passed ? 'Assessment Passed!' : 'Keep Practicing',
                style: Theme.of(context).textTheme.displaySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                '$pct%',
                style: TextStyle(
                  fontSize: 56,
                  fontWeight: FontWeight.w800,
                  color: passed ? AppColors.success : AppColors.error,
                ),
              ),
              Text(
                '${result['score']} / ${result['total']} correct',
                style: const TextStyle(
                    color: AppColors.slate400, fontWeight: FontWeight.w600),
              ),

              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Back to Assessments'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
