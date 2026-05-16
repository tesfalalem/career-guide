import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

final _allUsersProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.adminUsers);
  final list = res.data as List? ?? [];
  return list.map((u) => Map<String, dynamic>.from(u)).toList();
});

class AdminUsersScreen extends ConsumerWidget {
  const AdminUsersScreen({super.key});

  Color _roleColor(String role) {
    switch (role) {
      case 'teacher':
        return AppColors.teacherTeal;
      case 'admin':
        return AppColors.adminIndigo;
      case 'bit':
        return AppColors.bitSky;
      default:
        return AppColors.studentBlue;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(_allUsersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('All Users')),
      body: usersAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.adminIndigo)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (users) => ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: users.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final u = users[i];
            final role = u['role'] as String? ?? 'student';
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Theme.of(context).cardTheme.color,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.slate100),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: _roleColor(role).withOpacity(0.15),
                    child: Text(
                      (u['name'] as String? ?? '?')[0].toUpperCase(),
                      style: TextStyle(
                          color: _roleColor(role), fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(u['name'] ?? '',
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                        Text(u['email'] ?? '',
                            style: const TextStyle(
                                fontSize: 11, color: AppColors.slate400),
                            overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _roleColor(role).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(role,
                        style: TextStyle(
                            color: _roleColor(role),
                            fontSize: 10,
                            fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
