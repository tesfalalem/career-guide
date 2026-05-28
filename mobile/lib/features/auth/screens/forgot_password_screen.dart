import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  // Steps: 0 = enter email, 1 = enter code + new password, 2 = success
  int _step = 0;

  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();

  final _emailCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _loading = false;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _codeCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    if (!_emailFormKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        ApiConstants.forgotPassword,
        data: {'email': _emailCtrl.text.trim()},
      );
      if (mounted) setState(() => _step = 1);
    } catch (e) {
      if (mounted) {
        setState(() => _error = _parseError(e));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resetPassword() async {
    if (!_resetFormKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        ApiConstants.resetPassword,
        data: {
          'email': _emailCtrl.text.trim(),
          'token': _codeCtrl.text.trim(),
          'password': _passwordCtrl.text,
          'password_confirmation': _confirmCtrl.text,
        },
      );
      if (mounted) setState(() => _step = 2);
    } catch (e) {
      if (mounted) {
        setState(() => _error = _parseError(e));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _parseError(dynamic e) {
    final msg = e.toString();
    if (msg.contains('Invalid') || msg.contains('invalid')) {
      return 'Invalid or expired reset code. Please try again.';
    }
    if (msg.contains('not found') || msg.contains('404')) {
      return 'No account found with that email address.';
    }
    return msg.replaceAll('Exception: ', '');
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
          child: _step == 2 ? _buildSuccess() : _buildForm(),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Column(
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
          child: const Icon(Icons.lock_reset_rounded,
              color: AppColors.teal, size: 28),
        ),
        const SizedBox(height: 24),

        Text(
          _step == 0 ? 'Forgot Password?' : 'Reset Password',
          style: Theme.of(context).textTheme.displaySmall,
        ),
        const SizedBox(height: 8),
        Text(
          _step == 0
              ? 'Enter your email and we\'ll send you a reset code.'
              : 'Enter the code sent to ${_emailCtrl.text.trim()} and choose a new password.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),

        const SizedBox(height: 32),

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

        if (_step == 0) ...[
          Form(
            key: _emailFormKey,
            child: AppTextField(
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
          ),
          const SizedBox(height: 32),
          AppButton(
            label: 'Send Reset Code',
            onPressed: _sendCode,
            loading: _loading,
            fullWidth: true,
          ),
        ] else ...[
          Form(
            key: _resetFormKey,
            child: Column(
              children: [
                AppTextField(
                  controller: _codeCtrl,
                  label: 'Reset Code',
                  hint: 'Enter the 6-digit code',
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.pin_outlined,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Code is required';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _passwordCtrl,
                  label: 'New Password',
                  hint: '••••••••',
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
                    if (v.length < 6) return 'At least 6 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _confirmCtrl,
                  label: 'Confirm Password',
                  hint: '••••••••',
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
                    onPressed: () =>
                        setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty)
                      return 'Please confirm password';
                    if (v != _passwordCtrl.text)
                      return 'Passwords do not match';
                    return null;
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          AppButton(
            label: 'Reset Password',
            onPressed: _resetPassword,
            loading: _loading,
            fullWidth: true,
          ),
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: () => setState(() {
                _step = 0;
                _error = null;
              }),
              child: const Text(
                'Resend Code',
                style: TextStyle(
                  color: AppColors.teal,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ],
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
