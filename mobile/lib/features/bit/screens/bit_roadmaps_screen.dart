import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

final _bitRoadmapsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.bitRoadmaps);
  final list = res.data as List? ?? [];
  return list.map((r) => Map<String, dynamic>.from(r)).toList();
});

class BitRoadmapsScreen extends ConsumerWidget {
  const BitRoadmapsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roadmapsAsync = ref.watch(_bitRoadmapsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Roadmaps'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            onPressed: () => _showCreateDialog(context, ref),
          ),
        ],
      ),
      body: roadmapsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.bitSky)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (roadmaps) => roadmaps.isEmpty
            ? const Center(
                child: Text('No roadmaps yet. Tap + to create.',
                    style: TextStyle(color: AppColors.slate400)))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: roadmaps.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final r = roadmaps[i];
                  final isPublished = r['status'] == 'published';
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardTheme.color,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.slate100),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.bitSky.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.map_rounded,
                              color: AppColors.bitSky, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r['title'] ?? '',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis),
                              Text(r['category'] ?? '',
                                  style: const TextStyle(
                                      fontSize: 12, color: AppColors.slate400)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: (isPublished
                                    ? AppColors.success
                                    : AppColors.warning)
                                .withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            r['status'] ?? '',
                            style: TextStyle(
                                color: isPublished
                                    ? AppColors.success
                                    : AppColors.warning,
                                fontSize: 11,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }

  void _showCreateDialog(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _CreateRoadmapSheet(
        onCreated: () => ref.invalidate(_bitRoadmapsProvider),
      ),
    );
  }
}

class _CreateRoadmapSheet extends ConsumerStatefulWidget {
  final VoidCallback onCreated;
  const _CreateRoadmapSheet({required this.onCreated});

  @override
  ConsumerState<_CreateRoadmapSheet> createState() =>
      _CreateRoadmapSheetState();
}

class _CreateRoadmapSheetState extends ConsumerState<_CreateRoadmapSheet> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _categoryCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _categoryCtrl.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    if (_titleCtrl.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post(ApiConstants.bitRoadmaps, data: {
        'title': _titleCtrl.text,
        'description': _descCtrl.text,
        'category': _categoryCtrl.text,
        'phases': [],
        'status': 'draft',
      });
      widget.onCreated();
      if (mounted) Navigator.pop(context);
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
    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Create Roadmap',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),
          TextField(
            controller: _titleCtrl,
            decoration: const InputDecoration(labelText: 'Title'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _descCtrl,
            decoration: const InputDecoration(labelText: 'Description'),
            maxLines: 2,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _categoryCtrl,
            decoration: const InputDecoration(labelText: 'Category'),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _create,
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.bitSky,
                  padding: const EdgeInsets.symmetric(vertical: 14)),
              child: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Create Roadmap'),
            ),
          ),
        ],
      ),
    );
  }
}
