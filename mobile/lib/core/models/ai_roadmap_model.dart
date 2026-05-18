class AiRoadmapResourceModel {
  final String title;
  final String url;
  final String type;

  const AiRoadmapResourceModel({
    required this.title,
    required this.url,
    required this.type,
  });

  factory AiRoadmapResourceModel.fromJson(Map<String, dynamic> json) =>
      AiRoadmapResourceModel(
        title: json['title'] ?? '',
        url: json['url'] ?? '',
        type: json['type'] ?? 'link',
      );

  Map<String, dynamic> toJson() => {
        'title': title,
        'url': url,
        'type': type,
      };
}

class AiRoadmapTopicModel {
  final String title;
  final List<String> concepts;
  final List<AiRoadmapResourceModel> resources;

  const AiRoadmapTopicModel({
    required this.title,
    required this.concepts,
    required this.resources,
  });

  factory AiRoadmapTopicModel.fromJson(Map<String, dynamic> json) =>
      AiRoadmapTopicModel(
        title: json['title'] ?? '',
        concepts: List<String>.from(json['concepts'] ?? []),
        resources: (json['resources'] as List? ?? [])
            .map((r) => AiRoadmapResourceModel.fromJson(r))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'title': title,
        'concepts': concepts,
        'resources': resources.map((r) => r.toJson()).toList(),
      };
}

class AiRoadmapPhaseModel {
  final String title;
  final String description;
  final String duration;
  final List<AiRoadmapTopicModel> topics;

  const AiRoadmapPhaseModel({
    required this.title,
    required this.description,
    required this.duration,
    required this.topics,
  });

  factory AiRoadmapPhaseModel.fromJson(Map<String, dynamic> json) =>
      AiRoadmapPhaseModel(
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        duration: json['duration'] ?? '',
        topics: (json['topics'] as List? ?? [])
            .map((t) => AiRoadmapTopicModel.fromJson(t))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'duration': duration,
        'topics': topics.map((t) => t.toJson()).toList(),
      };
}

class AiRoadmapModel {
  final String role;
  final String title;
  final String description;
  final List<AiRoadmapPhaseModel> phases;

  const AiRoadmapModel({
    required this.role,
    required this.title,
    required this.description,
    required this.phases,
  });

  factory AiRoadmapModel.fromJson(Map<String, dynamic> json) {
    List<AiRoadmapPhaseModel> phases = [];
    if (json['phases'] != null) {
      final raw = json['phases'];
      if (raw is List) {
        phases = raw.map((p) => AiRoadmapPhaseModel.fromJson(p)).toList();
      }
    }
    return AiRoadmapModel(
      role: json['role'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      phases: phases,
    );
  }

  Map<String, dynamic> toJson() => {
        'role': role,
        'title': title,
        'description': description,
        'phases': phases.map((p) => p.toJson()).toList(),
      };
}
