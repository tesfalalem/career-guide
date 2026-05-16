import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

final _pendingResourcesProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.adminResources}/pending');
  final list = res.data as List? ?? [];
  return list.map((r) => Map<String, dynamic>.from(r)).toList();
});

class AdminResourcesScreen extends ConsumerWidget {
  const AdminResourcesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resourcesAsync = ref.watch(_pendingResourcesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pending Resources')),
      body: resourcesAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.adminIndigo)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (resources) => resources.isEmpty
            ? const Center(
                child: Text('No pending resources',
                    style: TextStyle(color: AppColors.slate400)))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: resources.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) =>
                    _ResourceCard(resource: resources[i], ref: ref),
              ),
      ),
    );
  }
}

class _ResourceCard extends StatefulWidget {
  final Map<String, dynamic> resource;
  final WidgetRef ref;
  const _ResourceCard({required this.resource, required this.ref});

  @override
  State<_ResourceCard> createState() => _ResourceCardState();
}

class _ResourceCardState extends State<_ResourceCard> {
  bool _loading = false;

  Future<void> _act(bool approve) async {
    setState(() => _loading = true);
    try {
      final api = widget.ref.read(apiClientProvider);
      final id = widget.resource['id'];
      final endpoint = approve
          ? '${ApiConstants.adminResources}/$id/approve'
          : '${ApiConstants.adminResources}/$id/reject';
      await api.post(endpoint);
      widget.ref.invalidate(_pendingResourcesProvider);
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
    final r = widget.resource;
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
          Text(r['title'] ?? '',
              style:
                  const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 4),
          Text(r['description'] ?? '',
              style: const TextStyle(fontSize: 12, color: AppColors.slate400),
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
          const SizedBox(height: 8),
          Row(
            children: [
              _Chip(
                  label: r['resource_type'] ?? '',
                  color: AppColors.adminIndigo),
              const SizedBox(width: 8),
              _Chip(label: r['category'] ?? '', color: AppColors.slate500),
              const Spacer(),
              Text('by ${r['uploader_name'] ?? ''}',
                  style:
                      const TextStyle(fontSize: 11, color: AppColors.slate400)),
            ],
          ),
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

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }
}
