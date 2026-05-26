import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/course_model.dart';

class CourseMaterialsTab extends ConsumerStatefulWidget {
  final CourseModel course;
  final bool isTeacherOrAdmin;

  const CourseMaterialsTab({
    super.key,
    required this.course,
    required this.isTeacherOrAdmin,
  });

  @override
  ConsumerState<CourseMaterialsTab> createState() => _CourseMaterialsTabState();
}

class _CourseMaterialsTabState extends ConsumerState<CourseMaterialsTab> {
  List<dynamic> _materials = [];
  bool _loading = true;
  String? _error;
  final Set<String> _expandedGroups = {};
  final Set<int> _expandedNotes = {};

  @override
  void initState() {
    super.initState();
    _fetchMaterials();
  }

  Future<void> _fetchMaterials() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final url = widget.isTeacherOrAdmin
          ? '${ApiConstants.baseUrl}/teacher/courses/${widget.course.id}/materials'
          : '${ApiConstants.baseUrl}/courses/${widget.course.id}/teacher-materials';
      final res = await api.get(url);
      final list = res.data as List? ?? [];
      
      setState(() {
        _materials = list;
        // Auto-expand all groups initially
        _expandedGroups.clear();
        for (var item in list) {
          final group = item['module_name'] ?? '__general__';
          _expandedGroups.add(group);
        }
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load materials: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  String _resolveUrl(String? urlString) {
    if (urlString == null || urlString.isEmpty) return '';
    final baseUri = Uri.parse(ApiConstants.baseUrl);
    final host = baseUri.host;
    // Replace localhost or 127.0.0.1 with emulator or physical device IP
    return urlString.replaceAll('localhost', host).replaceAll('127.0.0.1', host);
  }

  Future<void> _launchUrl(String urlString) async {
    final resolved = _resolveUrl(urlString);
    final Uri url = Uri.parse(resolved);
    try {
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw 'Could not launch $resolved';
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Unable to open link: $resolved'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  void _showAddEditForm([Map<String, dynamic>? editItem]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _MaterialForm(
        course: widget.course,
        editItem: editItem,
        onSaved: () {
          Navigator.pop(context);
          _fetchMaterials();
        },
      ),
    );
  }

  Future<void> _deleteMaterial(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Material', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to delete this material? Students will no longer be able to access it.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.slate500)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final api = ref.read(apiClientProvider);
        await api.delete('${ApiConstants.baseUrl}/teacher/materials/$id');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Material deleted successfully'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
        _fetchMaterials();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete material: $e'),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'document':
        return Colors.orange;
      case 'video':
        return Colors.purple;
      case 'link':
        return Colors.blue;
      case 'note':
        return Colors.amber;
      case 'article':
        return Colors.teal;
      case 'tutorial':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'document':
        return Icons.file_present_rounded;
      case 'video':
        return Icons.video_library_rounded;
      case 'link':
        return Icons.link_rounded;
      case 'note':
        return Icons.sticky_note_2_rounded;
      case 'article':
        return Icons.menu_book_rounded;
      case 'tutorial':
        return Icons.school_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_loading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: CircularProgressIndicator(color: AppColors.teal),
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
          child: Column(
            children: [
              Text(_error!, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _fetchMaterials,
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal),
                child: const Text('Retry', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    if (_materials.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
        child: Column(
          children: [
            Icon(Icons.folder_open_rounded, size: 64, color: isDark ? AppColors.slate700 : AppColors.slate300),
            const SizedBox(height: 16),
            const Text(
              'No Teacher Materials Yet',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              widget.isTeacherOrAdmin
                  ? 'Click "Add Material" to upload the first resource for this course.'
                  : 'Supplementary materials uploaded by your teacher will appear here.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.slate400, fontSize: 13),
            ),
            if (widget.isTeacherOrAdmin) ...[
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => _showAddEditForm(),
                icon: const Icon(Icons.add_rounded, color: Colors.white),
                label: const Text('Add Material', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.teal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
              ),
            ],
          ],
        ),
      );
    }

    // Group materials
    final Map<String, List<dynamic>> grouped = {};
    for (var m in _materials) {
      final key = m['module_name'] ?? '__general__';
      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(m);
    }

    // Sort group keys: __general__ first, then module names alphabetically
    final keys = grouped.keys.toList()
      ..sort((a, b) {
        if (a == '__general__') return -1;
        if (b == '__general__') return 1;
        return a.compareTo(b);
      });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Teacher Resources',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            if (widget.isTeacherOrAdmin)
              TextButton.icon(
                onPressed: () => _showAddEditForm(),
                icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.teal),
                label: const Text('Add Material', style: TextStyle(color: AppColors.teal, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
        const SizedBox(height: 12),
        ...keys.map((groupKey) {
          final label = groupKey == '__general__' ? 'General Materials' : groupKey;
          final items = grouped[groupKey]!;
          final isExpanded = _expandedGroups.contains(groupKey);

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 0,
            color: isDark ? AppColors.slate900 : Colors.white,
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                ListTile(
                  onTap: () {
                    setState(() {
                      if (isExpanded) {
                        _expandedGroups.remove(groupKey);
                      } else {
                        _expandedGroups.add(groupKey);
                      }
                    });
                  },
                  leading: Icon(
                    Icons.folder_open_rounded,
                    color: AppColors.teal.withOpacity(0.8),
                  ),
                  title: Text(
                    label,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  trailing: AnimatedRotation(
                    turns: isExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.slate400),
                  ),
                ),
                if (isExpanded) ...[
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, i) {
                        final m = items[i];
                        final type = m['resource_type'] ?? 'document';
                        final id = m['id'] as int;
                        final color = _getTypeColor(type);
                        final icon = _getTypeIcon(type);
                        final isNoteExpanded = _expandedNotes.contains(id);

                        return Container(
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.slate800.withOpacity(0.5) : AppColors.slate50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark ? AppColors.slate800 : AppColors.slate100,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: color.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Icon(icon, color: color, size: 20),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            m['title'] ?? '',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                          ),
                                          if (m['lesson_name'] != null && m['lesson_name'].toString().isNotEmpty) ...[
                                            const SizedBox(height: 4),
                                            Text(
                                              '📖 ${m['lesson_name']}',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: isDark ? AppColors.slate400 : AppColors.slate500,
                                              ),
                                            ),
                                          ],
                                          if (m['description'] != null && m['description'].toString().isNotEmpty) ...[
                                            const SizedBox(height: 4),
                                            Text(
                                              m['description'],
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: isDark ? AppColors.slate400 : AppColors.slate600,
                                              ),
                                            ),
                                          ],
                                          const SizedBox(height: 6),
                                          Row(
                                            children: [
                                              Icon(Icons.person_outline_rounded, size: 12, color: isDark ? AppColors.slate500 : AppColors.slate400),
                                              const SizedBox(width: 4),
                                              Text(
                                                m['teacher_name'] ?? 'Teacher',
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  color: isDark ? AppColors.slate500 : AppColors.slate400,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      children: [
                                        if (type == 'note')
                                          ElevatedButton(
                                            onPressed: () {
                                              setState(() {
                                                if (isNoteExpanded) {
                                                  _expandedNotes.remove(id);
                                                } else {
                                                  _expandedNotes.add(id);
                                                }
                                              });
                                            },
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.amber,
                                              elevation: 0,
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                            child: Text(
                                              isNoteExpanded ? 'Collapse' : 'Read Note',
                                              style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                                            ),
                                          )
                                        else if (m['external_url'] != null || m['file_url'] != null)
                                          ElevatedButton.icon(
                                            onPressed: () async {
                                              final url = m['file_url'] ?? m['external_url'];
                                              if (url != null) {
                                                _launchUrl(url);
                                                // Track download / view
                                                try {
                                                  final api = ref.read(apiClientProvider);
                                                  await api.post('${ApiConstants.baseUrl}/resources/$id/download');
                                                } catch (_) {}
                                              }
                                            },
                                            icon: Icon(
                                              type == 'link' || m['external_url'] != null
                                                  ? Icons.open_in_new_rounded
                                                  : Icons.download_rounded,
                                              size: 14,
                                              color: Colors.white,
                                            ),
                                            label: Text(
                                              type == 'link' || m['external_url'] != null ? 'Open' : 'Download',
                                              style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: AppColors.teal,
                                              elevation: 0,
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                          ),
                                        if (widget.isTeacherOrAdmin) ...[
                                          const SizedBox(height: 8),
                                          Row(
                                            children: [
                                              IconButton(
                                                icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.teal),
                                                onPressed: () => _showAddEditForm(m),
                                              ),
                                              IconButton(
                                                icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red),
                                                onPressed: () => _deleteMaterial(id),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              if (type == 'note' && isNoteExpanded && m['notes'] != null) ...[
                                const Divider(height: 1),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  color: isDark ? AppColors.slate900 : Colors.white,
                                  child: _HtmlText(html: m['notes'].toString()),
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          );
        }),
      ],
    );
  }
}

class _HtmlText extends StatelessWidget {
  final String html;
  const _HtmlText({required this.html});

  @override
  Widget build(BuildContext context) {
    // Strip basic HTML tags for display
    final text = html
        .replaceAll(RegExp(r'<br\s*/?>'), '\n')
        .replaceAll(RegExp(r'<[^>]+>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
    return Text(text, style: const TextStyle(fontSize: 13, height: 1.6));
  }
}

class _MaterialForm extends ConsumerStatefulWidget {
  final CourseModel course;
  final Map<String, dynamic>? editItem;
  final VoidCallback onSaved;

  const _MaterialForm({
    required this.course,
    this.editItem,
    required this.onSaved,
  });

  @override
  ConsumerState<_MaterialForm> createState() => _MaterialFormState();
}

class _MaterialFormState extends ConsumerState<_MaterialForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _urlCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  String _resourceType = 'document';
  String? _selectedModule;
  String? _selectedLesson;
  File? _selectedFile;
  String? _selectedFileName;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.editItem != null) {
      final m = widget.editItem!;
      _titleCtrl.text = m['title'] ?? '';
      _descCtrl.text = m['description'] ?? '';
      _resourceType = m['resource_type'] ?? 'document';
      _urlCtrl.text = m['external_url'] ?? '';
      _notesCtrl.text = m['notes'] ?? '';
      
      final mod = m['module_name'];
      if (mod != null && mod.toString().isNotEmpty) {
        _selectedModule = mod.toString();
        final les = m['lesson_name'];
        if (les != null && les.toString().isNotEmpty) {
          _selectedLesson = les.toString();
        }
      }
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _urlCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
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

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      
      if (widget.editItem != null) {
        // Edit Mode: PUT via JSON
        final id = widget.editItem!['id'];
        await api.put(
          '${ApiConstants.baseUrl}/teacher/materials/$id',
          data: {
            'title': _titleCtrl.text,
            'description': _descCtrl.text,
            'resource_type': _resourceType,
            'external_url': _urlCtrl.text,
            'module_name': _selectedModule ?? '',
            'lesson_name': _selectedLesson ?? '',
            'notes': _notesCtrl.text,
          },
        );
      } else {
        // Add Mode: POST via FormData (supports file upload)
        final Map<String, dynamic> formDataMap = {
          'title': _titleCtrl.text,
          'description': _descCtrl.text,
          'resource_type': _resourceType,
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
          '${ApiConstants.baseUrl}/teacher/courses/${widget.course.id}/materials',
          data: FormData.fromMap(formDataMap),
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.editItem != null ? 'Material updated successfully' : 'Material added successfully'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        widget.onSaved();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save material: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Find selected module to populate lessons dropdown
    final activeModule = widget.course.modules.firstWhere(
      (m) => m.title == _selectedModule,
      orElse: () => CourseModuleModel(title: '', lessons: []),
    );

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate950 : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.editItem != null ? 'Edit Material' : 'Add New Material',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Title Field
              TextFormField(
                controller: _titleCtrl,
                decoration: InputDecoration(
                  labelText: 'Title *',
                  hintText: 'e.g. Lecture Slides, Reference Book',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 16),

              // Description Field
              TextFormField(
                controller: _descCtrl,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Description',
                  hintText: 'Provide a brief summary of the resource',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),

              // Resource Type & Module selectors row
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _resourceType,
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
                        if (val != null) _resourceType = val;
                      }),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String?>(
                      value: _selectedModule,
                      decoration: InputDecoration(
                        labelText: 'Module (optional)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('— General —')),
                        ...widget.course.modules.map(
                          (m) => DropdownMenuItem(value: m.title, child: Text(m.title, overflow: TextOverflow.ellipsis)),
                        ),
                      ],
                      onChanged: (val) => setState(() {
                        _selectedModule = val;
                        _selectedLesson = null; // Reset lesson on module change
                      }),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Lesson selector (only active if module is selected)
              if (_selectedModule != null) ...[
                DropdownButtonFormField<String?>(
                  value: _selectedLesson,
                  decoration: InputDecoration(
                    labelText: 'Lesson (optional)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: [
                    const DropdownMenuItem(value: null, child: Text('— All lessons —')),
                    ...activeModule.lessons.map(
                      (l) => DropdownMenuItem(value: l.title, child: Text(l.title, overflow: TextOverflow.ellipsis)),
                    ),
                  ],
                  onChanged: (val) => setState(() => _selectedLesson = val),
                ),
                const SizedBox(height: 16),
              ],

              // File / URL section (for types other than note)
              if (_resourceType != 'note') ...[
                Row(
                  children: [
                    if (widget.editItem == null) ...[
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _pickFile,
                          icon: const Icon(Icons.upload_file_rounded),
                          label: Text(_selectedFileName != null ? 'Change File' : 'Upload File'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    Expanded(
                      child: TextFormField(
                        controller: _urlCtrl,
                        decoration: InputDecoration(
                          labelText: widget.editItem != null ? 'External URL' : 'Or External URL',
                          hintText: 'https://...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        keyboardType: TextInputType.url,
                      ),
                    ),
                  ],
                ),
                if (_selectedFileName != null) ...[
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      'Selected File: $_selectedFileName',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.teal),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
              ],

              // Notes Content section (for type = note)
              if (_resourceType == 'note') ...[
                TextFormField(
                  controller: _notesCtrl,
                  maxLines: 8,
                  decoration: InputDecoration(
                    labelText: 'Note Content',
                    hintText: 'Type your note text here...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (val) => val == null || val.isEmpty ? 'Note content is required' : null,
                ),
                const SizedBox(height: 16),
              ],

              // Action Buttons
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.teal,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _saving
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          widget.editItem != null ? 'UPDATE MATERIAL' : 'SAVE MATERIAL',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
