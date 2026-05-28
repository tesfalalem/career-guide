import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
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
                      itemBuilder: (context, i) => _ResourceTile(
                        resource: resources[i],
                        onChanged: () => ref.invalidate(_myResourcesProvider),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResourceTile extends ConsumerWidget {
  final Map<String, dynamic> resource;
  final VoidCallback onChanged;
  const _ResourceTile({required this.resource, required this.onChanged});

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

  void _showDeleteConfirm(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Resource', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete "${resource['title']}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.slate500)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              try {
                final api = ref.read(apiClientProvider);
                final id = resource['id'];
                final isCourseMaterial = resource['course_id'] != null;
                
                final url = isCourseMaterial 
                    ? '${ApiConstants.baseUrl}/teacher/materials/$id'
                    : '${ApiConstants.baseUrl}/teacher/resources/$id';
                    
                await api.delete(url);
                scaffoldMessenger.showSnackBar(
                  const SnackBar(content: Text('Resource deleted successfully')),
                );
                onChanged();
              } catch (e) {
                scaffoldMessenger.showSnackBar(
                  SnackBar(content: Text('Failed to delete resource: $e'), backgroundColor: AppColors.error),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, WidgetRef ref) {
    final titleCtrl = TextEditingController(text: resource['title'] ?? '');
    final descCtrl = TextEditingController(text: resource['description'] ?? '');
    final urlCtrl = TextEditingController(text: resource['external_url'] ?? '');
    final notesCtrl = TextEditingController(text: resource['notes'] ?? '');
    final categoryCtrl = TextEditingController(text: resource['category'] ?? '');
    
    List<dynamic> tagsList = resource['tags'] is List ? resource['tags'] : [];
    final tagsCtrl = TextEditingController(text: tagsList.join(', '));
    
    final isCourseMaterial = resource['course_id'] != null;
    final type = resource['resource_type'] ?? 'document';

    showDialog(
      context: context,
      builder: (context) {
        bool loading = false;
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Edit Resource', style: TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.9,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppTextField(controller: titleCtrl, label: 'Title'),
                      const SizedBox(height: 12),
                      AppTextField(controller: descCtrl, label: 'Description', maxLines: 2),
                      const SizedBox(height: 12),
                      if (type != 'note') ...[
                        AppTextField(
                          controller: urlCtrl,
                          label: 'External URL',
                          hint: 'https://...',
                        ),
                        const SizedBox(height: 12),
                      ] else ...[
                        AppTextField(
                          controller: notesCtrl,
                          label: 'Note Content',
                          maxLines: 4,
                        ),
                        const SizedBox(height: 12),
                      ],
                      if (!isCourseMaterial) ...[
                        AppTextField(controller: categoryCtrl, label: 'Category'),
                        const SizedBox(height: 12),
                      ],
                      AppTextField(
                        controller: tagsCtrl,
                        label: 'Tags (comma-separated)',
                        hint: 'react, javascript',
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: loading ? null : () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.slate500)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.teacherTeal),
                  onPressed: loading ? null : () async {
                    if (titleCtrl.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Title is required')),
                      );
                      return;
                    }
                    
                    setState(() => loading = true);
                    final scaffoldMessenger = ScaffoldMessenger.of(context);
                    final navigator = Navigator.of(context);
                    
                    try {
                      final api = ref.read(apiClientProvider);
                      final id = resource['id'];
                      
                      final Map<String, dynamic> updateData = {
                        'title': titleCtrl.text,
                        'description': descCtrl.text,
                        'resource_type': type,
                        'tags': tagsCtrl.text,
                      };
                      
                      if (type == 'note') {
                        updateData['notes'] = notesCtrl.text;
                      } else {
                        updateData['external_url'] = urlCtrl.text;
                      }
                      
                      if (!isCourseMaterial) {
                        updateData['category'] = categoryCtrl.text;
                      }

                      final url = isCourseMaterial 
                          ? '${ApiConstants.baseUrl}/teacher/materials/$id'
                          : '${ApiConstants.baseUrl}/teacher/resources/$id';
                          
                      await api.put(url, data: updateData);
                      
                      scaffoldMessenger.showSnackBar(
                        const SnackBar(content: Text('Resource updated successfully')),
                      );
                      navigator.pop();
                      onChanged();
                    } catch (e) {
                      scaffoldMessenger.showSnackBar(
                        SnackBar(content: Text('Failed to update resource: $e'), backgroundColor: AppColors.error),
                      );
                    } finally {
                      setState(() => loading = false);
                    }
                  },
                  child: loading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save Changes', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate900 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.slate800 : AppColors.slate100),
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
          const SizedBox(width: 8),
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
          const SizedBox(width: 4),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert_rounded, color: isDark ? Colors.white70 : AppColors.slate600, size: 20),
            onSelected: (val) {
              if (val == 'edit') {
                _showEditDialog(context, ref);
              } else if (val == 'delete') {
                _showDeleteConfirm(context, ref);
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit_rounded, size: 18),
                    SizedBox(width: 8),
                    Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete_rounded, size: 18, color: AppColors.error),
                    SizedBox(width: 8),
                    Text('Delete', style: TextStyle(color: AppColors.error)),
                  ],
                ),
              ),
            ],
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
  final _notesCtrl = TextEditingController();
  
  String _type = 'document';
  bool _loading = false;
  
  List<dynamic> _assignments = [];
  bool _loadingAssignments = false;
  String? _selectedCourseId;
  String? _selectedModule;
  String? _selectedLesson;
  File? _selectedFile;
  String? _selectedFileName;

  @override
  void initState() {
    super.initState();
    _fetchAssignments();
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _categoryCtrl.dispose();
    _urlCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchAssignments() async {
    setState(() => _loadingAssignments = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get('${ApiConstants.baseUrl}/course-assignments/approved');
      setState(() {
        _assignments = res.data as List? ?? [];
      });
    } catch (_) {
      // Ignored
    } finally {
      setState(() => _loadingAssignments = false);
    }
  }

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.any,
      );
      if (result != null && result.files.single.path != null) {
        setState(() {
          _selectedFile = File(result.files.single.path!);
          _selectedFileName = result.files.single.name;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to pick file: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _upload() async {
    if (_titleCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Title is required')));
      return;
    }
    
    // If not a course resource, category is required
    if (_selectedCourseId == null && _categoryCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Category is required for general resources')));
      return;
    }
    
    if (_type == 'note' && _notesCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Note content is required')));
      return;
    }

    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);

      if (_selectedCourseId != null) {
        // Course specific resource -> POST /api/teacher/courses/:id/materials
        final Map<String, dynamic> formDataMap = {
          'title': _titleCtrl.text,
          'description': _descCtrl.text,
          'resource_type': _type,
          'module_name': _selectedModule ?? '',
          'lesson_name': _selectedLesson ?? '',
          'notes': _notesCtrl.text,
          'external_url': _urlCtrl.text,
        };
        
        if (_selectedFile != null) {
          formDataMap['file'] = await MultipartFile.fromFile(
            _selectedFile!.path,
            filename: _selectedFileName,
          );
        }
        
        await api.post(
          '${ApiConstants.baseUrl}/teacher/courses/$_selectedCourseId/materials',
          data: FormData.fromMap(formDataMap),
        );
      } else {
        // General resource -> POST /api/teacher/resources
        final formData = {
          'title': _titleCtrl.text,
          'description': _descCtrl.text,
          'resource_type': _type,
          'category': _categoryCtrl.text,
          'external_url': _urlCtrl.text,
        };
        await api.post(ApiConstants.teacherResources, data: formData);
      }
      
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Find current selected assignment to populate modules
    final activeAssignment = _assignments.firstWhere(
      (a) => a['course_id']?.toString() == _selectedCourseId,
      orElse: () => null,
    );
    
    final List<dynamic> modules = (activeAssignment != null && activeAssignment['modules'] is List)
        ? activeAssignment['modules']
        : [];
        
    final activeModule = modules.firstWhere(
      (m) => m['title'] == _selectedModule,
      orElse: () => null,
    );
    
    final List<dynamic> lessons = (activeModule != null && activeModule['lessons'] is List)
        ? activeModule['lessons']
        : [];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: isDark ? AppColors.slate800 : AppColors.slate100)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Upload New Resource',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 12),
          
          // Course dropdown
          _loadingAssignments
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8.0),
                  child: LinearProgressIndicator(color: AppColors.teacherTeal),
                )
              : DropdownButtonFormField<String?>(
                  value: _selectedCourseId,
                  decoration: InputDecoration(
                    labelText: 'Select Course',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: [
                    const DropdownMenuItem(value: null, child: Text('— General Resource (Not Course-Specific) —')),
                    ..._assignments.map(
                      (a) => DropdownMenuItem(
                        value: a['course_id']?.toString(),
                        child: Text(a['course_title'] ?? '', overflow: TextOverflow.ellipsis),
                      ),
                    ),
                  ],
                  onChanged: (val) => setState(() {
                    _selectedCourseId = val;
                    _selectedModule = null;
                    _selectedLesson = null;
                  }),
                ),
          const SizedBox(height: 10),

          // Module & Lesson dropdowns (only if course selected)
          if (_selectedCourseId != null) ...[
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    value: _selectedModule,
                    decoration: InputDecoration(
                      labelText: 'Module (optional)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('— General —')),
                      ...modules.map(
                        (m) => DropdownMenuItem(
                          value: m['title']?.toString(),
                          child: Text(m['title'] ?? '', overflow: TextOverflow.ellipsis),
                        ),
                      ),
                    ],
                    onChanged: (val) => setState(() {
                      _selectedModule = val;
                      _selectedLesson = null;
                    }),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    value: _selectedLesson,
                    decoration: InputDecoration(
                      labelText: 'Lesson (optional)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('— All lessons —')),
                      ...lessons.map(
                        (l) => DropdownMenuItem(
                          value: l['title']?.toString(),
                          child: Text(l['title'] ?? '', overflow: TextOverflow.ellipsis),
                        ),
                      ),
                    ],
                    onChanged: _selectedModule == null
                        ? null
                        : (val) => setState(() => _selectedLesson = val),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],

          // Resource type dropdown
          DropdownButtonFormField<String>(
            value: _type,
            decoration: InputDecoration(
              labelText: 'Resource Type',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: const [
              DropdownMenuItem(value: 'document', child: Text('Document')),
              DropdownMenuItem(value: 'video', child: Text('Video')),
              DropdownMenuItem(value: 'link', child: Text('External Link')),
              DropdownMenuItem(value: 'note', child: Text('Formatted Note')),
              DropdownMenuItem(value: 'article', child: Text('Article')),
              DropdownMenuItem(value: 'tutorial', child: Text('Tutorial')),
            ],
            onChanged: (val) => setState(() {
              if (val != null) _type = val;
            }),
          ),
          const SizedBox(height: 10),

          AppTextField(controller: _titleCtrl, label: 'Title'),
          const SizedBox(height: 10),
          AppTextField(
              controller: _descCtrl, label: 'Description', maxLines: 2),
          const SizedBox(height: 10),
          
          if (_selectedCourseId == null) ...[
            AppTextField(controller: _categoryCtrl, label: 'Category'),
            const SizedBox(height: 10),
          ],

          // File / URL / Notes conditional inputs
          if (_type != 'note') ...[
            Row(
              children: [
                if (_selectedCourseId != null) ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _pickFile,
                      icon: const Icon(Icons.upload_file_rounded, color: AppColors.teacherTeal),
                      label: Text(_selectedFileName != null ? 'Change File' : 'Upload File', style: const TextStyle(color: AppColors.teacherTeal)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: AppColors.teacherTeal),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: AppTextField(
                    controller: _urlCtrl,
                    label: _selectedCourseId != null ? 'External URL' : 'External URL',
                    hint: 'https://...',
                    keyboardType: TextInputType.url,
                  ),
                ),
              ],
            ),
            if (_selectedFileName != null) ...[
              const SizedBox(height: 8),
              Text(
                'Selected: $_selectedFileName',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.teacherTeal),
              ),
            ],
            const SizedBox(height: 12),
          ] else ...[
            AppTextField(
              controller: _notesCtrl,
              label: 'Note Content',
              hint: 'Write your formatting notes here...',
              maxLines: 4,
            ),
            const SizedBox(height: 12),
          ],

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
