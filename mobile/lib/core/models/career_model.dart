class CareerModel {
  final int id;
  final String title;
  final String description;
  final String category;
  final List<String> requiredSkills;
  final String createdAt;

  CareerModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.requiredSkills,
    required this.createdAt,
  });

  factory CareerModel.fromJson(Map<String, dynamic> json) {
    final skillsData = json['required_skills'];
    List<String> skills = [];
    if (skillsData is List) {
      skills = skillsData.map((e) => e.toString()).toList();
    }
    
    return CareerModel(
      id: json['id'] is int ? json['id'] as int : int.parse(json['id']?.toString() ?? '0'),
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      requiredSkills: skills,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}
