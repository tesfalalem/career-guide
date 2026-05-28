import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  // ── Form keys ─────────────────────────────────────────────────────────────
  final _step0Key = GlobalKey<FormState>();
  final _step1Key = GlobalKey<FormState>();

  // Step 0 – account info
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;

  // Step 1 – academic info
  final _studentIdCtrl = TextEditingController();
  final _graduationYearCtrl = TextEditingController(text: '2026');
  String _department = '';
  String _academicYear = '';

  // Global state
  int _step = 0;
  bool _loading = false;
  String? _error;

  static const int _totalSteps = 2;

  static const _departments = [
    'Cyber Security',
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Information System',
    'Other',
  ];

  // 5th Year only available for Software Engineering and Other
  List<String> get _availableYears {
    final base = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    if (_department == 'Software Engineering' || _department == 'Other') {
      base.add('5th Year');
    }
    base.add('Postgraduate');
    return base;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _studentIdCtrl.dispose();
    _graduationYearCtrl.dispose();
    super.dispose();
  }

  // ── Step 0 → Step 1 ──────────────────────────────────────────────────────
  void _goToStep1() {
    if (_step0Key.currentState!.validate()) {
      setState(() {
        _error = null;
        _step = 1;
      });
    }
  }

  // ── Step 1 → Register ────────────────────────────────────────────────────
  Future<void> _register() async {
    if (!_step1Key.currentState!.validate()) return;

    // Extra validation for dropdowns
    if (_department.isEmpty) {
      setState(() => _error = 'Please select your department');
      return;
    }
    if (_academicYear.isEmpty) {
      setState(() => _error = 'Please select your academic year');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final user = await ref.read(authProvider.notifier).register({
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim().toLowerCase(),
        'phone_number': _phoneCtrl.text.trim(),
        'password': _passwordCtrl.text,
        'role_preference': 'student',
        'student_id': _studentIdCtrl.text.trim(),
        'department': _department,
        'academic_year': _academicYear,
        'graduation_year': int.tryParse(_graduationYearCtrl.text.trim()),
      });
      if (!mounted) return;
      context.go(user.isPending ? '/pending' : '/student');
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceAll('Exception: ', ''));
      }
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
                      margin:
                          EdgeInsets.only(right: i < _totalSteps - 1 ? 6 : 0),
                      decoration: BoxDecoration(
                        color: i <= _step ? AppColors.teal : AppColors.slate200,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // ── Title ─────────────────────────────────────────────────
              Text(
                _step == 0 ? 'Create Account' : 'Academic Info',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 8),
              Text(
                _step == 0
                    ? 'Join the BiT CareerGuide community'
                    : 'Tell us about your studies',
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
              if (_step == 1) _buildStep1(),

              const SizedBox(height: 32),

              // ── Action button ──────────────────────────────────────────
              AppButton(
                label: _step == 0 ? 'Continue' : 'Create Account',
                onPressed: _step == 0 ? _goToStep1 : _register,
                loading: _loading,
                fullWidth: true,
              ),

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
                      child: const Text(
                        'Sign In',
                        style: TextStyle(
                          color: AppColors.teal,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
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
              if (!v.trim().contains(' ')) {
                return 'Please enter first and father name';
              }
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
            controller: _phoneCtrl,
            label: 'Phone Number',
            hint: '+251912345678',
            keyboardType: TextInputType.phone,
            prefixIcon: Icons.phone_outlined,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Phone number is required';
              final phoneRegex = RegExp(r'^\+?[0-9\s\-()]+$');
              if (!phoneRegex.hasMatch(v.trim())) {
                return 'Only digits, spaces, dashes, parentheses';
              }
              final digits = v.trim().replaceAll(RegExp(r'[^0-9]'), '');
              if (digits.length < 9) return 'Must be at least 9 digits';
              if (digits.length > 15) return 'Must be at most 15 digits';
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
        ],
      ),
    );
  }

  // ── Step 1: Academic Info ─────────────────────────────────────────────────
  Widget _buildStep1() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Form(
      key: _step1Key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Row 1: Student ID + Department ──────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Student ID
              Expanded(
                child: AppTextField(
                  controller: _studentIdCtrl,
                  label: 'Student ID',
                  hint: 'BIT/123/14',
                  prefixIcon: Icons.badge_outlined,
                ),
              ),
              const SizedBox(width: 12),
              // Department
              Expanded(
                child: _DropdownField(
                  label: 'Department',
                  value: _department.isEmpty ? null : _department,
                  hint: 'Select Dept',
                  items: _departments,
                  isDark: isDark,
                  onChanged: (v) => setState(() {
                    _department = v ?? '';
                    // Reset year if 5th Year was selected but dept no longer supports it
                    if (_academicYear == '5th Year' &&
                        _department != 'Software Engineering' &&
                        _department != 'Other') {
                      _academicYear = '';
                    }
                  }),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // ── Row 2: Academic Year + Graduation Year ───────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Academic Year
              Expanded(
                child: _DropdownField(
                  label: 'Academic Year',
                  value: _academicYear.isEmpty ? null : _academicYear,
                  hint: 'Select Year',
                  items: _availableYears,
                  isDark: isDark,
                  onChanged: (v) => setState(() => _academicYear = v ?? ''),
                ),
              ),
              const SizedBox(width: 12),
              // Graduation Year
              Expanded(
                child: AppTextField(
                  controller: _graduationYearCtrl,
                  label: 'Graduation',
                  hint: '2026',
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.school_outlined,
                  validator: (v) {
                    if (v == null || v.isEmpty) return null; // optional
                    final yr = int.tryParse(v);
                    if (yr == null) return 'Numbers only';
                    if (yr < 2020 || yr > 2035) return '2020–2035';
                    return null;
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Reusable dropdown field ───────────────────────────────────────────────────
class _DropdownField extends StatelessWidget {
  final String label;
  final String? value;
  final String hint;
  final List<String> items;
  final bool isDark;
  final ValueChanged<String?> onChanged;

  const _DropdownField({
    required this.label,
    required this.value,
    required this.hint,
    required this.items,
    required this.isDark,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.slate500,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.slate800 : AppColors.slate50,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? AppColors.slate700 : AppColors.slate200,
            ),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              hint: Text(
                hint,
                style: const TextStyle(
                  color: AppColors.slate400,
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              borderRadius: BorderRadius.circular(14),
              dropdownColor: isDark ? AppColors.slate800 : Colors.white,
              icon: const Icon(Icons.keyboard_arrow_down_rounded,
                  color: AppColors.slate400),
              items: items
                  .map((item) => DropdownMenuItem(
                        value: item,
                        child: Text(
                          item,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            color: isDark ? Colors.white : AppColors.slate900,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ))
                  .toList(),
              onChanged: onChanged,
            ),
          ),
        ),
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
      child: Text(
        message,
        style: const TextStyle(
          color: AppColors.error,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
