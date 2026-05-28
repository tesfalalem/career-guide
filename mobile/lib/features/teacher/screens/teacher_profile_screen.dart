import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/app_text_field.dart';

final teacherProfileProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.baseUrl}/teacher/profile');
  return Map<String, dynamic>.from(res.data['profile'] ?? res.data);
});

class TeacherProfileScreen extends ConsumerWidget {
  const TeacherProfileScreen({super.key});

  void _showEditDialog(BuildContext context, WidgetRef ref, Map<String, dynamic> profile) {
    final nameCtrl = TextEditingController(text: profile['name'] ?? '');
    final instCtrl = TextEditingController(text: profile['institution'] ?? '');
    final bioCtrl = TextEditingController(text: profile['bio'] ?? '');
    final expCtrl = TextEditingController(text: profile['years_experience']?.toString() ?? '0');
    final linkedinCtrl = TextEditingController(text: profile['linkedin_url'] ?? '');
    
    // Expertise & qualifications lists -> join by comma
    final List<dynamic> expAreas = profile['expertise_areas'] is List ? profile['expertise_areas'] : [];
    final List<dynamic> quals = profile['qualifications'] is List ? profile['qualifications'] : [];
    
    final expertiseCtrl = TextEditingController(text: expAreas.join(', '));
    final qualsCtrl = TextEditingController(text: quals.join(', '));

    showDialog(
      context: context,
      builder: (context) {
        bool saving = false;
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.9,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      AppTextField(controller: nameCtrl, label: 'Full Name'),
                      const SizedBox(height: 12),
                      AppTextField(controller: instCtrl, label: 'Institution'),
                      const SizedBox(height: 12),
                      AppTextField(controller: bioCtrl, label: 'Bio', maxLines: 3),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: expCtrl,
                        label: 'Years of Experience',
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: linkedinCtrl,
                        label: 'LinkedIn URL',
                        hint: 'https://linkedin.com/in/...',
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: expertiseCtrl,
                        label: 'Expertise Areas (comma-separated)',
                        hint: 'Flutter, PHP, Databases',
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: qualsCtrl,
                        label: 'Qualifications (comma-separated)',
                        hint: 'Ph.D. in CS, M.Sc. in IT',
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: saving ? null : () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.slate500)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.teacherTeal),
                  onPressed: saving
                      ? null
                      : () async {
                          if (nameCtrl.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Name is required')),
                            );
                            return;
                          }

                          setState(() => saving = true);
                          final scaffoldMessenger = ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);
                          
                          try {
                            final api = ref.read(apiClientProvider);
                            
                            // Parse tags
                            final parsedExpertise = expertiseCtrl.text
                                .split(',')
                                .map((s) => s.trim())
                                .where((s) => s.isNotEmpty)
                                .toList();
                                
                            final parsedQuals = qualsCtrl.text
                                .split(',')
                                .map((s) => s.trim())
                                .where((s) => s.isNotEmpty)
                                .toList();

                            await api.put(
                              '${ApiConstants.baseUrl}/teacher/profile',
                              data: {
                                'name': nameCtrl.text,
                                'institution': instCtrl.text,
                                'bio': bioCtrl.text,
                                'yearsExperience': int.tryParse(expCtrl.text) ?? 0,
                                'linkedin': linkedinCtrl.text,
                                'expertiseAreas': parsedExpertise,
                                'qualifications': parsedQuals,
                              },
                            );

                            // Sync global user state name if updated
                            final currentGlobalUser = ref.read(currentUserProvider);
                            if (currentGlobalUser != null) {
                              ref.read(authProvider.notifier).updateUser(
                                    currentGlobalUser.copyWith(name: nameCtrl.text),
                                  );
                            }

                            ref.invalidate(teacherProfileProvider);
                            scaffoldMessenger.showSnackBar(
                              const SnackBar(content: Text('Profile updated successfully')),
                            );
                            navigator.pop();
                          } catch (e) {
                            scaffoldMessenger.showSnackBar(
                              SnackBar(
                                  content: Text('Failed to update profile: $e'),
                                  backgroundColor: AppColors.error),
                            );
                          } finally {
                            setState(() => saving = false);
                          }
                        },
                  child: saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Save', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final themeMode = ref.watch(themeModeProvider);
    final profileAsync = ref.watch(teacherProfileProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(title: 'My Profile'),
      body: RefreshIndicator(
        color: AppColors.teacherTeal,
        onRefresh: () => ref.refresh(teacherProfileProvider.future),
        child: profileAsync.when(
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.teacherTeal)),
          error: (e, _) => Center(child: Text('Error: $e')),
          data: (profile) {
            final List<dynamic> expertise = profile['expertise_areas'] is List
                ? profile['expertise_areas']
                : [];
            final List<dynamic> qualifications = profile['qualifications'] is List
                ? profile['qualifications']
                : [];

            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 48,
                        backgroundColor: AppColors.teacherTeal,
                        child: Text(user?.initials ?? '?',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.w800)),
                      ),
                      const SizedBox(height: 14),
                      Text(user?.name ?? '',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              )),
                      const SizedBox(height: 4),
                      Text(user?.email ?? '',
                          style: const TextStyle(color: AppColors.slate400)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.teacherTeal.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text('Teacher',
                            style: TextStyle(
                                color: AppColors.teacherTeal,
                                fontWeight: FontWeight.w800,
                                fontSize: 11)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: () => _showEditDialog(context, ref, profile),
                  icon: const Icon(Icons.edit_rounded, size: 16),
                  label: const Text('Edit Profile'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.teacherTeal,
                    side: const BorderSide(color: AppColors.teacherTeal),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 28),
                
                // Institution
                _ProfileSection(
                  title: 'Institution',
                  icon: Icons.business_outlined,
                  child: Text(profile['institution'] ?? 'Not specified',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                const Divider(height: 30),

                // Experience
                _ProfileSection(
                  title: 'Years of Experience',
                  icon: Icons.timeline_outlined,
                  child: Text('${profile['years_experience'] ?? 0} Years',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                const Divider(height: 30),

                // Bio
                _ProfileSection(
                  title: 'Bio',
                  icon: Icons.notes_rounded,
                  child: Text(
                    profile['bio'] != null && profile['bio'].toString().isNotEmpty
                        ? profile['bio']
                        : 'No bio added yet.',
                    style: const TextStyle(height: 1.4),
                  ),
                ),
                const Divider(height: 30),

                // LinkedIn
                _ProfileSection(
                  title: 'LinkedIn',
                  icon: Icons.link_rounded,
                  child: Text(
                    profile['linkedin_url'] != null &&
                            profile['linkedin_url'].toString().isNotEmpty
                        ? profile['linkedin_url']
                        : 'No LinkedIn link provided.',
                    style: TextStyle(
                      color: profile['linkedin_url'] != null &&
                              profile['linkedin_url'].toString().isNotEmpty
                          ? AppColors.teacherTeal
                          : AppColors.slate500,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const Divider(height: 30),

                // Expertise Areas
                _ProfileSection(
                  title: 'Expertise Areas',
                  icon: Icons.bookmark_added_outlined,
                  child: expertise.isEmpty
                      ? const Text('No expertise areas specified yet.',
                          style: TextStyle(color: AppColors.slate400))
                      : Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: expertise.map((exp) {
                            return Chip(
                              label: Text(exp.toString()),
                              backgroundColor: AppColors.teacherTeal.withOpacity(0.08),
                              labelStyle: const TextStyle(
                                  color: AppColors.teacherTeal,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold),
                              side: BorderSide.none,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8)),
                            );
                          }).toList(),
                        ),
                ),
                const Divider(height: 30),

                // Qualifications
                _ProfileSection(
                  title: 'Qualifications',
                  icon: Icons.school_outlined,
                  child: qualifications.isEmpty
                      ? const Text('No qualifications added.',
                          style: TextStyle(color: AppColors.slate400))
                      : Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: qualifications.map((q) {
                            return Chip(
                              label: Text(q.toString()),
                              backgroundColor: isDark ? AppColors.slate800 : AppColors.slate100,
                              labelStyle: const TextStyle(
                                  fontSize: 12, fontWeight: FontWeight.w600),
                              side: BorderSide.none,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8)),
                            );
                          }).toList(),
                        ),
                ),
                const Divider(height: 40),

                // Theme Toggle
                ListTile(
                  leading: Icon(
                    themeMode == ThemeMode.dark
                        ? Icons.light_mode_rounded
                        : Icons.dark_mode_rounded,
                    color: AppColors.teacherTeal,
                  ),
                  title: Text(
                    themeMode == ThemeMode.dark ? 'Light Mode' : 'Dark Mode',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  trailing: Switch(
                    value: themeMode == ThemeMode.dark,
                    onChanged: (_) =>
                        ref.read(themeModeProvider.notifier).toggle(),
                    activeColor: AppColors.teacherTeal,
                  ),
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 10),
                
                // Logout
                ListTile(
                  leading: const Icon(Icons.logout_rounded, color: AppColors.error),
                  title: const Text('Logout',
                      style: TextStyle(
                          color: AppColors.error, fontWeight: FontWeight.w600)),
                  onTap: () => ref.read(authProvider.notifier).logout(),
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 20),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ProfileSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;

  const _ProfileSection(
      {required this.title, required this.icon, required this.child});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: AppColors.teacherTeal, size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                  color: AppColors.slate400),
            ),
          ],
        ),
        const SizedBox(height: 10),
        child,
      ],
    );
  }
}
