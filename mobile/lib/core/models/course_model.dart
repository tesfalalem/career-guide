class LessonModel {
  final String title;
  final String content;
  final String duration;
  final bool isCompleted;

  const LessonModel({
    required this.title,
    required this.content,
    required this.duration,
    this.isCompleted = false,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) => LessonModel(
        title: json['title'] ?? '',
        content: json['content'] ?? '',
        duration: json['duration'] ?? '',
        isCompleted: json['isCompleted'] ?? false,
      );
}

class CourseModuleModel {
  final String title;
  final List<LessonModel> lessons;

  const CourseModuleModel({required this.title, required this.lessons});

  factory CourseModuleModel.fromJson(Map<String, dynamic> json) =>
      CourseModuleModel(
        title: json['title'] ?? '',
        lessons: (json['lessons'] as List? ?? [])
            .map((l) => LessonModel.fromJson(l))
            .toList(),
      );
}

class CourseModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String level;
  final List<CourseModuleModel> modules;
  final String author;
  final String duration;
  final double rating;
  final int enrolled;
  final int? progress;
  final List<String> completedLessons;

  const CourseModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.level,
    required this.modules,
    required this.author,
    required this.duration,
    this.rating = 4.8,
    this.enrolled = 0,
    this.progress,
    this.completedLessons = const [],
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    List<CourseModuleModel> modules = [];
    if (json['modules'] != null) {
      final raw = json['modules'];
      if (raw is List) {
        modules = raw.map((m) => CourseModuleModel.fromJson(m)).toList();
      }
    }

    List<String> completedLessons = [];
    if (json['completed_lessons'] != null) {
      final raw = json['completed_lessons'];
      if (raw is List) {
        completedLessons = List<String>.from(raw);
      }
    }

    return CourseModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      level: json['level'] ?? 'Beginner',
      modules: modules,
      author: json['author'] ?? 'AI Architect',
      duration: json['duration'] ?? '',
      rating: double.tryParse(json['rating']?.toString() ?? '4.8') ?? 4.8,
      enrolled: int.tryParse(json['enrolled_count']?.toString() ?? '0') ?? 0,
      progress: int.tryParse(json['progress']?.toString() ?? ''),
      completedLessons: completedLessons,
    );
  }

  int get totalLessons =>
      modules.fold(0, (sum, m) => sum + m.lessons.length);
}
