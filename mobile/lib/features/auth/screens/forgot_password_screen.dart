import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  // Steps: 0 = reset form, 1 = success
  int _step = 0;

  final _formKey = GlobalKey<FormState>();

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _loading = false;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Check password strength
    final pwd = _passwordCtrl.text;
    final hasLetter = RegExp(r'[A-Za-z]').hasMatch(pwd);
    final hasNumOrSymbol = RegExp(r'[\d\W]').hasMatch(pwd);
    if (!hasLetter || !hasNumOrSymbol) {
      setState(() => _error = 'Password must include both letters and numbers/symbols');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authProvider.notifier).forgotPassword(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim().toLowerCase(),
        phone: _phoneCtrl.text.trim(),
        password: _passwordCtrl.text,
        confirmPassword: _confirmCtrl.text,
      );
      if (mounted) setState(() => _step = 1);
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceAll('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          color: Theme.of(context).colorScheme.onSurface,
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: _step == 1 ? _buildSuccess() : _buildForm(),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.teal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.security_rounded,
                color: AppColors.teal, size: 28),
          ),
          const SizedBox(height: 24),

          Text(
            'Reset Password',
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Verify your identity fields to reset your password.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),

          const SizedBox(height: 24),

          // Error banner
          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.error.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline,
                      color: AppColors.error, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        color: AppColors.error,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Full Name
          AppTextField(
            controller: _nameCtrl,
            label: 'Full Name',
            hint: 'Enter your full name',
            prefixIcon: Icons.person_outline,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Full name is required';
              if (v.trim().length < 5) return 'At least 5 characters';
              if (!v.trim().contains(' ')) return 'Enter first and father name';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Email
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

          // Phone Number
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

          // New Password
          AppTextField(
            controller: _passwordCtrl,
            label: 'New Password',
            hint: 'At least 8 characters',
            obscureText: _obscureNew,
            prefixIcon: Icons.lock_outline,
            suffixIcon: IconButton(
              icon: Icon(
                _obscureNew
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: AppColors.slate400,
                size: 20,
              ),
              onPressed: () => setState(() => _obscureNew = !_obscureNew),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Password is required';
              if (v.length < 8) return 'At least 8 characters';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Confirm Password
          AppTextField(
            controller: _confirmCtrl,
            label: 'Confirm New Password',
            hint: 'Confirm new password',
            obscureText: _obscureConfirm,
            prefixIcon: Icons.lock_outline,
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirm
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: AppColors.slate400,
                size: 20,
              ),
              onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Please confirm password';
              if (v != _passwordCtrl.text) return 'Passwords do not match';
              return null;
            },
          ),

          const SizedBox(height: 32),
          AppButton(
            label: 'Verify & Reset Password',
            onPressed: _resetPassword,
            loading: _loading,
            fullWidth: true,
          ),
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: () => context.pop(),
              child: const Text(
                'Back to Login',
                style: TextStyle(
                  color: AppColors.teal,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccess() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(height: 60),
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.success.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle_rounded,
              color: AppColors.success, size: 44),
        ),
        const SizedBox(height: 24),
        Text(
          'Password Reset!',
          style: Theme.of(context).textTheme.displaySmall,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          'Your password has been successfully reset. You can now sign in with your new password.',
          style: Theme.of(context).textTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        AppButton(
          label: 'Back to Sign In',
          onPressed: () => context.go('/login'),
          fullWidth: true,
        ),
      ],
    );
  }
}
