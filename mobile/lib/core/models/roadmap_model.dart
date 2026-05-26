class RoadmapTopicModel {
  final String title;
  final List<String> concepts;

  const RoadmapTopicModel({required this.title, required this.concepts});

  factory RoadmapTopicModel.fromJson(Map<String, dynamic> json) =>
      RoadmapTopicModel(
        title: json['title'] ?? '',
        concepts: List<String>.from(json['concepts'] ?? []),
      );
}

class RoadmapPhaseModel {
  final String id;
  final String title;
  final String description;
  final String duration;
  final List<RoadmapTopicModel> topics;

  const RoadmapPhaseModel({
    required this.id,
    required this.title,
    required this.description,
    required this.duration,
    required this.topics,
  });

  factory RoadmapPhaseModel.fromJson(Map<String, dynamic> json) =>
      RoadmapPhaseModel(
        id: json['id']?.toString() ?? '',
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        duration: json['duration'] ?? '',
        topics: (json['topics'] as List? ?? [])
            .map((t) => RoadmapTopicModel.fromJson(t))
            .toList(),
      );
}

class CuratedRoadmapModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String difficultyLevel;
  final String estimatedDuration;
  final List<String> tags;
  final List<RoadmapPhaseModel> phases;
  final int views;
  final int enrollments;
  final String creatorName;

  const CuratedRoadmapModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.difficultyLevel,
    required this.estimatedDuration,
    required this.tags,
    required this.phases,
    required this.views,
    required this.enrollments,
    required this.creatorName,
  });

  factory CuratedRoadmapModel.fromJson(Map<String, dynamic> json) {
    List<RoadmapPhaseModel> phases = [];
    if (json['phases'] != null) {
      final raw = json['phases'];
      if (raw is List && raw.isNotEmpty) {
        // Detect multi-level format: [{level:'beginner', phases:[...]}, ...]
        final first = raw.first;
        if (first is Map &&
            first.containsKey('level') &&
            first.containsKey('phases')) {
          // Multi-level BiT roadmap — flatten all levels into a single list
          // but prefix each phase title with the level label for clarity
          for (final levelEntry in raw) {
            if (levelEntry is Map) {
              final levelLabel = levelEntry['label']?.toString() ??
                  levelEntry['level']?.toString() ??
                  '';
              final levelPhases = levelEntry['phases'];
              if (levelPhases is List) {
                for (final p in levelPhases) {
                  if (p is Map<String, dynamic>) {
                    phases.add(RoadmapPhaseModel.fromJson({
                      ...p,
                      // Prepend level label to phase title so students know which level
                      'title': '[$levelLabel] ${p['title'] ?? ''}',
                    }));
                  }
                }
              }
            }
          }
        } else {
          // Old flat format
          phases = raw
              .whereType<Map<String, dynamic>>()
              .map((p) => RoadmapPhaseModel.fromJson(p))
              .toList();
        }
      }
    }

    List<String> tags = [];
    if (json['tags'] != null && json['tags'] is List) {
      tags = List<String>.from(json['tags']);
    }

    return CuratedRoadmapModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      difficultyLevel: json['difficulty_level'] ?? 'beginner',
      estimatedDuration: json['estimated_duration'] ?? '',
      tags: tags,
      phases: phases,
      views: int.tryParse(json['views']?.toString() ?? '0') ?? 0,
      enrollments: int.tryParse(json['enrollments']?.toString() ?? '0') ?? 0,
      creatorName: json['creator_name'] ?? 'BiT',
    );
  }
}
