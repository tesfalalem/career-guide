class NotificationModel {
  final int id;
  final int userId;
  final String type;
  final String title;
  final String message;
  final String? link;
  final bool isRead;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.message,
    this.link,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      NotificationModel(
        id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
        userId: int.tryParse(json['user_id']?.toString() ?? '0') ?? 0,
        type: json['type'] ?? 'info',
        title: json['title'] ?? '',
        message: json['message'] ?? '',
        link: json['link'],
        isRead: json['is_read'] == true || json['is_read'] == 1,
        createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      );
}
