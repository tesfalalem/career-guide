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
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _studentIdCtrl = TextEditingController();
  String _role = 'student';
  String _academicYear = '1st Year';
  bool _loading = false;
  bool _obscure = true;
  String? _error;
  int _step = 0; // 0 = account info, 1 = academic info

  final _years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _studentIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    if (mounted)
      setState(() {
        _loading = true;
        _error = null;
      });
    try {
      await ref.read(authProvider.notifier).register({
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim().toLowerCase(),
        'password': _passwordCtrl.text,
        'role_preference': _role,
        'academic_year': _academicYear,
        'student_id': _studentIdCtrl.text.trim(),
      });
      // Navigate explicitly after successful registration
      if (mounted) context.go('/student');
    } catch (e) {
      if (mounted)
        setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.go('/login'),
        ),
        title: Text('Step ${_step + 1} of 2'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Progress indicator
                Row(
                  children: List.generate(
                      2,
                      (i) => Expanded(
                            child: Container(
                              height: 4,
                              margin: EdgeInsets.only(right: i == 0 ? 6 : 0),
                              decoration: BoxDecoration(
                                color: i <= _step
                                    ? AppColors.teal
                                    : AppColors.slate200,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          )),
                ),

                const SizedBox(height: 32),

                Text(
                  _step == 0 ? 'Create Account' : 'Academic Info',
                  style: Theme.of(context).textTheme.displaySmall,
                ),
                const SizedBox(height: 8),
                Text(
                  _step == 0
                      ? 'Join thousands of BiT students'
                      : 'Tell us about your studies',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 32),

                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: AppColors.error.withOpacity(0.3)),
                    ),
                    child: Text(_error!,
                        style: const TextStyle(
                            color: AppColors.error,
                            fontSize: 13,
                            fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(height: 20),
                ],

                if (_step == 0) ...[
                  AppTextField(
                    controller: _nameCtrl,
                    label: 'Full Name',
                    hint: 'First and Father name',
                    prefixIcon: Icons.person_outline,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty)
                        return 'Name is required';
                      if (v.trim().length < 5) return 'At least 5 characters';
                      if (!v.trim().contains(' '))
                        return 'Enter first and father name';
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

                  // Role selector
                  Text('I am a',
                      style: Theme.of(context).textTheme.titleMedium),
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
                ] else ...[
                  AppTextField(
                    controller: _studentIdCtrl,
                    label: 'Student ID',
                    hint: 'BIT/123/14',
                    prefixIcon: Icons.badge_outlined,
                  ),
                  const SizedBox(height: 16),

                  // Academic year dropdown
                  Text('Academic Year',
                      style: Theme.of(context).textTheme.titleMedium),
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

                const SizedBox(height: 32),

                AppButton(
                  label: _step == 0 ? 'Continue' : 'Continue',
                  onPressed: _step == 0
                      ? () {
                          if (_formKey.currentState!.validate()) {
                            setState(() => _step = 1);
                          }
                        }
                      : _register,
                  loading: _loading,
                  fullWidth: true,
                ),

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
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _RoleChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color:
                selected ? AppColors.teal.withOpacity(0.1) : Colors.transparent,
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
