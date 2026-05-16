import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

final _pendingApprovalsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.adminApprovals);
  final list = res.data as List? ?? [];
  return list.map((u) => Map<String, dynamic>.from(u)).toList();
});

class AdminApprovalsScreen extends ConsumerWidget {
  const AdminApprovalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final approvalsAsync = ref.watch(_pendingApprovalsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pending Approvals')),
      body: approvalsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.adminIndigo)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (approvals) => approvals.isEmpty
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.check_circle_outline,
                        size: 64, color: AppColors.success),
                    SizedBox(height: 16),
                    Text('All caught up!',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                    SizedBox(height: 8),
                    Text('No pending approvals',
                        style: TextStyle(color: AppColors.slate400)),
                  ],
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: approvals.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) =>
                    _ApprovalCard(user: approvals[i], ref: ref),
              ),
      ),
    );
  }
}

class _ApprovalCard extends StatefulWidget {
  final Map<String, dynamic> user;
  final WidgetRef ref;
  const _ApprovalCard({required this.user, required this.ref});

  @override
  State<_ApprovalCard> createState() => _ApprovalCardState();
}

class _ApprovalCardState extends State<_ApprovalCard> {
  bool _loading = false;

  Future<void> _act(bool approve) async {
    setState(() => _loading = true);
    try {
      final api = widget.ref.read(apiClientProvider);
      final id = widget.user['id'];
      final endpoint = approve
          ? '/admin/approvals/$id/approve'
          : '/admin/approvals/$id/reject';
      await api.post(endpoint, data: {'notes': ''});
      widget.ref.invalidate(_pendingApprovalsProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final u = widget.user;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.slate100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.adminIndigo,
                child: Text(
                  (u['name'] as String? ?? '?')[0].toUpperCase(),
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(u['name'] ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    Text(u['email'] ?? '',
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate400)),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Pending',
                    style: TextStyle(
                        color: AppColors.warning,
                        fontSize: 11,
                        fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          if (u['institution'] != null) ...[
            const SizedBox(height: 10),
            Text('Institution: ${u['institution']}',
                style:
                    const TextStyle(fontSize: 12, color: AppColors.slate500)),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _loading ? null : () => _act(false),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: const BorderSide(color: AppColors.error),
                  ),
                  child: const Text('Reject'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _loading ? null : () => _act(true),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success),
                  child: _loading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Approve'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
