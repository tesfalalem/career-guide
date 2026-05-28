import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/course_model.dart';
import '../models/roadmap_model.dart';
import '../network/api_client.dart';
import '../constants/api_constants.dart';
import 'local_db.dart';
import 'connectivity_service.dart';

// ── Cache keys ─────────────────────────────────────────────────────────────
const _kAllCourses = 'all_courses';
const _kEnrolledCourses = 'enrolled_courses';
const _kCuratedRoadmaps = 'curated_roadmaps';

// ── Cached: All Courses ────────────────────────────────────────────────────

/// Cache-first provider for all courses (browse tab).
/// Falls back to SQLite cache when offline.
final cachedAllCoursesProvider = FutureProvider<List<CourseModel>>((ref) async {
  final online = await isOnline();
  final cache = LocalDb.instance;

  if (online) {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get(ApiConstants.courses);
      final list = res.data as List? ?? [];
      final courses = list.map((c) => CourseModel.fromJson(c)).toList();

      // Persist to cache (1 hour TTL)
      await cache.put(_kAllCourses, list, ttlSecs: 3600);
      return courses;
    } catch (_) {
      // Network error — fall through to cache
    }
  }

  // Offline or network error: serve from cache
  final cached = await cache.get(_kAllCourses);
  if (cached != null) {
    final list = cached as List;
    return list.map((c) => CourseModel.fromJson(c)).toList();
  }
  return [];
});

// ── Cached: Enrolled Courses ───────────────────────────────────────────────

/// Cache-first provider for enrolled courses (my courses tab).
final cachedEnrolledCoursesProvider =
    FutureProvider<List<CourseModel>>((ref) async {
  final online = await isOnline();
  final cache = LocalDb.instance;

  if (online) {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get(ApiConstants.userCourses);
      final list = res.data as List? ?? [];
      final courses = list.map((c) => CourseModel.fromJson(c)).toList();

      // Persist to cache (30 min TTL — more dynamic data)
      await cache.put(_kEnrolledCourses, list, ttlSecs: 1800);
      return courses;
    } catch (_) {
      // Fall through to cache
    }
  }

  final cached = await cache.get(_kEnrolledCourses);
  if (cached != null) {
    final list = cached as List;
    return list.map((c) => CourseModel.fromJson(c)).toList();
  }
  return [];
});

// ── Cached: Curated Roadmaps ───────────────────────────────────────────────

/// Cache-first provider for curated roadmaps.
final cachedCuratedRoadmapsProvider =
    FutureProvider<List<CuratedRoadmapModel>>((ref) async {
  final online = await isOnline();
  final cache = LocalDb.instance;

  if (online) {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get(
        ApiConstants.curatedRoadmaps,
        queryParameters: {'status': 'published'},
      );
      final list = res.data as List? ?? [];
      final roadmaps =
          list.map((r) => CuratedRoadmapModel.fromJson(r)).toList();

      await cache.put(_kCuratedRoadmaps, list, ttlSecs: 3600);
      return roadmaps;
    } catch (_) {
      // Fall through to cache
    }
  }

  final cached = await cache.get(_kCuratedRoadmaps);
  if (cached != null) {
    final list = cached as List;
    return list.map((r) => CuratedRoadmapModel.fromJson(r)).toList();
  }
  return [];
});

// ── Sync service ───────────────────────────────────────────────────────────

/// Call this on app startup or when connectivity is restored to flush
/// any pending mutations (e.g., progress updates made offline).
/// Accepts both [Ref] (from providers) and [WidgetRef] (from widgets).
Future<void> syncPendingMutations(WidgetRef ref) async {
  final online = await isOnline();
  if (!online) return;

  final cache = LocalDb.instance;
  final pending = await cache.getPendingSyncs();
  if (pending.isEmpty) return;

  final api = ref.read(apiClientProvider);

  for (final item in pending) {
    try {
      final method = item['method'] as String;
      final endpoint = item['endpoint'] as String;
      final rawPayload = item['payload'] as String?;
      final payload = rawPayload != null && rawPayload.isNotEmpty
          ? Map<String, dynamic>.from(jsonDecode(rawPayload) as Map)
          : null;

      if (method == 'POST') {
        await api.post(endpoint, data: payload);
      } else if (method == 'PUT') {
        await api.put(endpoint, data: payload);
      }

      await cache.removeSyncItem(item['id'] as int);
    } catch (_) {
      // Leave in queue to retry next time
    }
  }
}
