import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  // ── Form keys (one per step to isolate validation) ───────────────────────
  final _step0Key = GlobalKey<FormState>();
  final _step1Key = GlobalKey<FormState>();

  // Step 0 – shared account info
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String _role = 'student';
  bool _obscure = true;

  // Step 1 – student academic info
  final _studentIdCtrl = TextEditingController();
  String _academicYear = '1st Year';

  // Step 1 – teacher professional info
  final _institutionCtrl = TextEditingController();
  final _experienceCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();

  // Step 2 – teacher course selection (loaded lazily on enter)
  final Set<int> _selectedCourseIds = {};
  List<Map<String, dynamic>> _bitCourses = [];
  bool _loadingCourses = false;
  String? _coursesError;

  // Global state
  int _step = 0;
  bool _loading = false;
  String? _error;

  final _years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  int get _totalSteps => _role == 'teacher' ? 3 : 2;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _studentIdCtrl.dispose();
    _institutionCtrl.dispose();
    _experienceCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  // ── Step 0 → Step 1 ──────────────────────────────────────────────────────
  void _goToStep1() {
    if (_step0Key.currentState!.validate()) {
      setState(() { _error = null; _step = 1; });
    }
  }

  // ── Step 1 (student) → register + navigate ────────────────────────────────
  Future<void> _registerStudent() async {
    if (!_step1Key.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      final user = await ref.read(authProvider.notifier).register({
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim().toLowerCase(),
        'password': _passwordCtrl.text,
        'role_preference': 'student',
        'student_id': _studentIdCtrl.text.trim(),
        'academic_year': _academicYear,
      });
      if (!mounted) return;
      if (user.isPending) {
        context.go('/pending');
      } else {
        context.go('/student');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceAll('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Step 1 (teacher) → validate only, move to Step 2 ─────────────────────
  void _goToTeacherStep2() {
    if (!_step1Key.currentState!.validate()) return;
    setState(() { _error = null; _step = 2; });
    _fetchBitCourses();
  }

  // ── Fetch BiT courses for teacher Step 2 ─────────────────────────────────
  Future<void> _fetchBitCourses() async {
    setState(() { _loadingCourses = true; _coursesError = null; });
    try {
      // First register the teacher account so we have a JWT token
      // (only if not already registered in this session)
      if (ref.read(currentUserProvider) == null) {
        await ref.read(authProvider.notifier).register({
          'name': _nameCtrl.text.trim(),
          'email': _emailCtrl.text.trim().toLowerCase(),
          'password': _passwordCtrl.text,
          'role_preference': 'teacher',
          'institution': _institutionCtrl.text.trim(),
          'years_experience': int.tryParse(_experienceCtrl.text.trim()) ?? 0,
          'bio': _bioCtrl.text.trim(),
        });
      }
      if (!mounted) return;
      // Now fetch BiT courses with the fresh JWT
      final api = ref.read(apiClientProvider);
      final res = await api.get(ApiConstants.availableBitCourses);
      final list = res.data as List? ?? [];
      if (mounted) {
        setState(() {
          _bitCourses = list.map((c) => Map<String, dynamic>.from(c)).toList();
        });
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['error'] ?? e.message ?? 'Failed to load courses';
      if (mounted) setState(() => _coursesError = msg);
    } catch (e) {
      if (mounted) {
        setState(() => _coursesError = e.toString().replaceAll('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loadingCourses = false);
    }
  }

  // ── Step 2 (teacher) → submit course selection ────────────────────────────
  Future<void> _submitCourses() async {
    if (_selectedCourseIds.isEmpty) {
      setState(() => _error = 'Please select at least 1 course.');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        ApiConstants.requestMultipleCourses,
        data: {'course_ids': _selectedCourseIds.toList()},
      );
      if (mounted) context.go('/pending');
    } on DioException catch (e) {
      final msg = e.response?.data?['error'] ?? 'Failed to submit courses';
      if (mounted) setState(() => _error = msg);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Back ──────────────────────────────────────────────────────────────────
  void _handleBack() {
    if (_step == 0) {
      context.go('/login');
    } else {
      setState(() {
        _error = null;
        _coursesError = null;
        _step--;
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: _handleBack,
        ),
        title: Text('Step ${_step + 1} of $_totalSteps'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Progress bar ───────────────────────────────────────────
              Row(
                children: List.generate(
                  _totalSteps,
                  (i) => Expanded(
                    child: Container(
                      height: 4,
                      margin: EdgeInsets.only(
                          right: i < _totalSteps - 1 ? 6 : 0),
                      decoration: BoxDecoration(
                        color: i <= _step
                            ? AppColors.teal
                            : AppColors.slate200,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // ── Title ─────────────────────────────────────────────────
              Text(
                _stepTitle,
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 8),
              Text(
                _stepSubtitle,
                style: Theme.of(context).textTheme.bodyMedium,
              ),

              const SizedBox(height: 32),

              // ── Error banner ───────────────────────────────────────────
              if (_error != null) ...[
                _ErrorBanner(message: _error!),
                const SizedBox(height: 20),
              ],

              // ── Step content ───────────────────────────────────────────
              if (_step == 0) _buildStep0(),
              if (_step == 1 && _role == 'student') _buildStudentStep1(),
              if (_step == 1 && _role == 'teacher') _buildTeacherStep1(),
              if (_step == 2 && _role == 'teacher') _buildTeacherStep2(),

              const SizedBox(height: 32),

              // ── Action button ──────────────────────────────────────────
              _buildActionButton(),

              // ── Login link ─────────────────────────────────────────────
              if (_step == 0) ...[
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Already have an account? ',
                        style: Theme.of(context).textTheme.bodyMedium),
                    GestureDetector(
                      onTap: () => context.go('/login'),
                      child: const Text('Sign In',
                          style: TextStyle(
                              color: AppColors.teal,
                              fontWeight: FontWeight.w700,
                              fontSize: 14)),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  String get _stepTitle {
    if (_step == 0) return 'Create Account';
    if (_step == 1) return _role == 'teacher' ? 'Complete your profile' : 'Academic Info';
    return 'Course Selection';
  }

  String get _stepSubtitle {
    if (_step == 0) return 'Join thousands of BiT students';
    if (_step == 1) {
      return _role == 'teacher'
          ? 'Fill in your teacher details to personalize your experience'
          : 'Tell us about your studies';
    }
    return 'Choose 1–3 courses you are eligible to instruct';
  }

  Widget _buildActionButton() {
    if (_step == 0) {
      return AppButton(
        label: 'Continue',
        onPressed: _goToStep1,
        loading: false,
        fullWidth: true,
      );
    }
    if (_step == 1 && _role == 'student') {
      return AppButton(
        label: 'Create Account',
        onPressed: _registerStudent,
        loading: _loading,
        fullWidth: true,
      );
    }
    if (_step == 1 && _role == 'teacher') {
      return AppButton(
        label: 'Continue',
        onPressed: _goToTeacherStep2,
        loading: false,
        fullWidth: true,
      );
    }
    // Step 2 – teacher course selection
    return AppButton(
      label: 'Submit & Finish',
      onPressed: _submitCourses,
      loading: _loading,
      fullWidth: true,
      color: AppColors.teacherTeal,
    );
  }

  // ── Step 0: Account Info ──────────────────────────────────────────────────
  Widget _buildStep0() {
    return Form(
      key: _step0Key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppTextField(
            controller: _nameCtrl,
            label: 'Full Name',
            hint: 'First and Father name',
            prefixIcon: Icons.person_outline,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Name is required';
              if (v.trim().length < 5) return 'At least 5 characters';
              if (!v.trim().contains(' ')) return 'Enter first and father name';
              return null;
            },
          ),
          const SizedBox(height: 16),
          AppTextField(
            controller: _emailCtrl,
            label: 'Email Address',
            hint: 'your.email@bit.bdu.edu.et',
            keyboardType: TextInputType.emailAddress,
            prefixIcon: Icons.email_outlined,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Email is required';
              if (!v.contains('@')) return 'Enter a valid email';
              return null;
            },
          ),
          const SizedBox(height: 16),
          AppTextField(
            controller: _passwordCtrl,
            label: 'Password',
            hint: 'At least 6 characters',
            obscureText: _obscure,
            prefixIcon: Icons.lock_outline,
            suffixIcon: IconButton(
              icon: Icon(
                _obscure
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: AppColors.slate400,
                size: 20,
              ),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Password is required';
              if (v.length < 6) return 'At least 6 characters';
              return null;
            },
          ),
          const SizedBox(height: 24),
          Text('I am a', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          Row(
            children: [
              _RoleChip(
                label: 'Student',
                icon: Icons.school_outlined,
                selected: _role == 'student',
                onTap: () => setState(() => _role = 'student'),
              ),
              const SizedBox(width: 12),
              _RoleChip(
                label: 'Teacher',
                icon: Icons.cast_for_education_outlined,
                selected: _role == 'teacher',
                onTap: () => setState(() => _role = 'teacher'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Step 1 (Student): Academic Info ───────────────────────────────────────
  Widget _buildStudentStep1() {
    return Form(
      key: _step1Key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppTextField(
            controller: _studentIdCtrl,
            label: 'Student ID',
            hint: 'BIT/123/14',
            prefixIcon: Icons.badge_outlined,
          ),
          const SizedBox(height: 16),
          Text('Academic Year', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).inputDecorationTheme.fillColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.slate200),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _academicYear,
                isExpanded: true,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                borderRadius: BorderRadius.circular(14),
                items: _years
                    .map((y) => DropdownMenuItem(
                          value: y,
                          child: Text(y,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600)),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _academicYear = v!),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 1 (Teacher): Professional Info ───────────────────────────────────
  Widget _buildTeacherStep1() {
    return Form(
      key: _step1Key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: AppTextField(
                  controller: _institutionCtrl,
                  label: 'Institution',
                  hint: 'Bahir Dar University',
                  prefixIcon: Icons.business_outlined,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: AppTextField(
                  controller: _experienceCtrl,
                  label: 'Experience (yrs)',
                  hint: '5',
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.timeline_outlined,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    if (int.tryParse(v.trim()) == null) return 'Numbers only';
                    return null;
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          AppTextField(
            controller: _bioCtrl,
            label: 'Bio',
            hint: 'Brief professional bio...',
            maxLines: 4,
            prefixIcon: Icons.notes_rounded,
          ),
        ],
      ),
    );
  }

  // ── Step 2 (Teacher): Course Selection ────────────────────────────────────
  Widget _buildTeacherStep2() {
    if (_loadingCourses) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 60),
          child: Column(
            children: [
              CircularProgressIndicator(color: AppColors.teacherTeal),
              SizedBox(height: 16),
              Text('Setting up your account…',
                  style: TextStyle(color: AppColors.slate400, fontSize: 13)),
            ],
          ),
        ),
      );
    }

    if (_coursesError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 30),
          child: Column(
            children: [
              const Icon(Icons.cloud_off_rounded,
                  size: 48, color: AppColors.slate300),
              const SizedBox(height: 12),
              Text(_coursesError!,
                  style: const TextStyle(color: AppColors.slate400),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() => _coursesError = null);
                  _fetchBitCourses();
                },
                icon: const Icon(Icons.refresh_rounded,
                    color: AppColors.teacherTeal),
                label: const Text('Retry',
                    style: TextStyle(color: AppColors.teacherTeal)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.teacherTeal),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_bitCourses.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Text(
            'No courses available yet. Please contact admin.',
            style: TextStyle(color: AppColors.slate400),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Selection counter
        Row(
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _selectedCourseIds.isEmpty
                    ? AppColors.slate100
                    : AppColors.teacherTeal.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.check_circle_rounded,
                    size: 16,
                    color: _selectedCourseIds.isEmpty
                        ? AppColors.slate400
                        : AppColors.teacherTeal,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${_selectedCourseIds.length}/3 selected',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _selectedCourseIds.isEmpty
                          ? AppColors.slate400
                          : AppColors.teacherTeal,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Min 1 • Max 3',
              style: TextStyle(
                  fontSize: 11,
                  color: AppColors.slate400,
                  fontStyle: FontStyle.italic),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Course list
        ..._bitCourses.map((course) {
          final id = course['id'] as int? ?? 0;
          final isSelected = _selectedCourseIds.contains(id);
          final isDisabled = !isSelected && _selectedCourseIds.length >= 3;
          final level = course['level'] as String? ?? 'Beginner';
          final category = course['category'] as String? ?? '';

          final levelColor = level == 'Advanced'
              ? AppColors.adminIndigo
              : level == 'Intermediate'
                  ? AppColors.navy
                  : AppColors.teacherTeal;

          return GestureDetector(
            onTap: isDisabled
                ? null
                : () => setState(() {
                      _error = null;
                      if (isSelected) {
                        _selectedCourseIds.remove(id);
                      } else {
                        _selectedCourseIds.add(id);
                      }
                    }),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.teacherTeal.withOpacity(0.08)
                    : isDisabled
                        ? AppColors.slate100.withOpacity(0.5)
                        : Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? AppColors.teacherTeal
                      : AppColors.slate200,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  // Checkbox
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.teacherTeal
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.teacherTeal
                            : isDisabled
                                ? AppColors.slate300
                                : AppColors.slate400,
                        width: 2,
                      ),
                    ),
                    child: isSelected
                        ? const Icon(Icons.check_rounded,
                            size: 14, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course['title'] ?? '',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: isDisabled ? AppColors.slate400 : null,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            if (category.isNotEmpty) ...[
                              Text(
                                category,
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.slate400,
                                    fontWeight: FontWeight.w500),
                              ),
                              const Text(' · ',
                                  style: TextStyle(
                                      color: AppColors.slate400,
                                      fontSize: 11)),
                            ],
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: levelColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                level,
                                style: TextStyle(
                                    color: levelColor,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),

        const SizedBox(height: 8),
      ],
    );
  }
}

// ── Error banner ──────────────────────────────────────────────────────────────
class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Text(message,
          style: const TextStyle(
              color: AppColors.error,
              fontSize: 13,
              fontWeight: FontWeight.w600)),
    );
  }
}

// ── Role Chip ─────────────────────────────────────────────────────────────────
class _RoleChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _RoleChip(
      {required this.label,
      required this.icon,
      required this.selected,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.teal.withOpacity(0.1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? AppColors.teal : AppColors.slate200,
              width: selected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon,
                  color: selected ? AppColors.teal : AppColors.slate400,
                  size: 28),
              const SizedBox(height: 8),
              Text(label,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: selected ? AppColors.teal : AppColors.slate500,
                  )),
            ],
          ),
        ),
      ),
    );
  }
}
