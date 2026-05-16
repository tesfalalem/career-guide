import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/notification_model.dart';
import '../../../shared/widgets/app_header.dart';

final _notificationsProvider =
    FutureProvider<List<NotificationModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(ApiConstants.notifications);
  final list = res.data['notifications'] as List? ?? [];
  return list.map((n) => NotificationModel.fromJson(n)).toList();
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  IconData _iconForType(String type) {
    switch (type) {
      case 'new_roadmap':
        return Icons.map_rounded;
      case 'new_resource':
        return Icons.folder_rounded;
      case 'assignment_approved':
        return Icons.check_circle_rounded;
      case 'assignment_rejected':
        return Icons.cancel_rounded;
      case 'course_request':
        return Icons.school_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'new_roadmap':
        return AppColors.teal;
      case 'new_resource':
        return AppColors.navy;
      case 'assignment_approved':
        return AppColors.success;
      case 'assignment_rejected':
        return AppColors.error;
      default:
        return AppColors.slate400;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(_notificationsProvider);

    return Scaffold(
      appBar: AppHeader(
        title: 'Notifications',
        showDrawerButton: false,
        actions: [
          TextButton(
            onPressed: () async {
              final api = ref.read(apiClientProvider);
              await api.put(ApiConstants.notificationsMarkAllRead);
              ref.invalidate(_notificationsProvider);
            },
            child: const Text('Mark all read',
                style: TextStyle(color: AppColors.teal, fontSize: 12)),
          ),
        ],
      ),
      body: notificationsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.teal)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (notifications) => notifications.isEmpty
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_none_rounded,
                        size: 64, color: AppColors.slate300),
                    SizedBox(height: 16),
                    Text('No notifications',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                  ],
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: notifications.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final n = notifications[i];
                  return Dismissible(
                    key: Key('notif_${n.id}'),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20),
                      decoration: BoxDecoration(
                        color: AppColors.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.delete_rounded,
                          color: AppColors.error),
                    ),
                    onDismissed: (_) async {
                      final api = ref.read(apiClientProvider);
                      await api.delete('${ApiConstants.notifications}/${n.id}');
                      ref.invalidate(_notificationsProvider);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: n.isRead
                            ? Theme.of(context).cardTheme.color
                            : AppColors.teal.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: n.isRead
                              ? AppColors.slate100
                              : AppColors.teal.withOpacity(0.2),
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: _colorForType(n.type).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(_iconForType(n.type),
                                color: _colorForType(n.type), size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(n.title,
                                    style: TextStyle(
                                        fontWeight: n.isRead
                                            ? FontWeight.w600
                                            : FontWeight.w800,
                                        fontSize: 14)),
                                const SizedBox(height: 3),
                                Text(n.message,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.slate400),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 4),
                                Text(
                                  timeago.format(n.createdAt),
                                  style: const TextStyle(
                                      fontSize: 11, color: AppColors.slate400),
                                ),
                              ],
                            ),
                          ),
                          if (!n.isRead)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.teal,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
