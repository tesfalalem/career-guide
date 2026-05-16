import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

final _myResourcesProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.teacherResources);
  final list = res.data as List? ?? [];
  return list.map((r) => Map<String, dynamic>.from(r)).toList();
});

class TeacherResourcesScreen extends ConsumerStatefulWidget {
  const TeacherResourcesScreen({super.key});

  @override
  ConsumerState<TeacherResourcesScreen> createState() =>
      _TeacherResourcesScreenState();
}

class _TeacherResourcesScreenState
    extends ConsumerState<TeacherResourcesScreen> {
  bool _showForm = false;

  @override
  Widget build(BuildContext context) {
    final resourcesAsync = ref.watch(_myResourcesProvider);

    return Scaffold(
      appBar: AppHeader(
        title: 'My Resources',
        actions: [
          IconButton(
            icon: Icon(_showForm ? Icons.close : Icons.add_rounded),
            onPressed: () => setState(() => _showForm = !_showForm),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_showForm)
            _UploadForm(onUploaded: () {
              setState(() => _showForm = false);
              ref.invalidate(_myResourcesProvider);
            }),
          Expanded(
            child: resourcesAsync.when(
              loading: () => const Center(
                  child:
                      CircularProgressIndicator(color: AppColors.teacherTeal)),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (resources) => resources.isEmpty
                  ? const Center(
                      child: Text('No resources yet. Tap + to upload.',
                          style: TextStyle(color: AppColors.slate400)))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: resources.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, i) =>
                          _ResourceTile(resource: resources[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResourceTile extends StatelessWidget {
  final Map<String, dynamic> resource;
  const _ResourceTile({required this.resource});

  Color get _statusColor {
    switch (resource['status']) {
      case 'approved':
        return AppColors.success;
      case 'rejected':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  @override
  Widget build(BuildContext context) {
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
              color: AppColors.teacherTeal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.description_rounded,
                color: AppColors.teacherTeal, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(resource['title'] ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text(resource['category'] ?? '',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.slate400)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              resource['status'] ?? '',
              style: TextStyle(
                  color: _statusColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _UploadForm extends ConsumerStatefulWidget {
  final VoidCallback onUploaded;
  const _UploadForm({required this.onUploaded});

  @override
  ConsumerState<_UploadForm> createState() => _UploadFormState();
}

class _UploadFormState extends ConsumerState<_UploadForm> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _categoryCtrl = TextEditingController();
  final _urlCtrl = TextEditingController();
  String _type = 'article';
  bool _loading = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _categoryCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _upload() async {
    if (_titleCtrl.text.isEmpty || _categoryCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Title and category are required')));
      return;
    }
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final formData = {
        'title': _titleCtrl.text,
        'description': _descCtrl.text,
        'resource_type': _type,
        'category': _categoryCtrl.text,
        'external_url': _urlCtrl.text,
      };
      await api.post(ApiConstants.teacherResources, data: formData);
      widget.onUploaded();
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
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.slate100)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Upload New Resource',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 12),
          AppTextField(controller: _titleCtrl, label: 'Title'),
          const SizedBox(height: 10),
          AppTextField(
              controller: _descCtrl, label: 'Description', maxLines: 2),
          const SizedBox(height: 10),
          AppTextField(controller: _categoryCtrl, label: 'Category'),
          const SizedBox(height: 10),
          AppTextField(
              controller: _urlCtrl,
              label: 'External URL',
              hint: 'https://...',
              keyboardType: TextInputType.url),
          const SizedBox(height: 12),
          AppTealButton(
            label: 'Upload Resource',
            onPressed: _upload,
            loading: _loading,
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
