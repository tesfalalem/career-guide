import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/course_model.dart';
import '../../../core/models/roadmap_model.dart';

// Student stats
final studentStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.userStats);
    return Map<String, dynamic>.from(res.data);
  } catch (_) {
    return {
      'totalXP': 0,
      'coursesEnrolled': 0,
      'streak': 0,
      'completedLessons': 0
    };
  }
});

// Enrolled courses
final enrolledCoursesProvider = FutureProvider<List<CourseModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.userCourses);
    final list = res.data as List? ?? [];
    return list.map((c) => CourseModel.fromJson(c)).toList();
  } catch (_) {
    return [];
  }
});

// Curated roadmaps
final curatedRoadmapsProvider =
    FutureProvider.family<List<CuratedRoadmapModel>, Map<String, String>>(
        (ref, filters) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get(
    ApiConstants.curatedRoadmaps,
    queryParameters: filters,
  );
  final list = res.data as List? ?? [];
  return list.map((r) => CuratedRoadmapModel.fromJson(r)).toList();
});

// Single roadmap detail
final roadmapDetailProvider =
    FutureProvider.family<CuratedRoadmapModel, String>((ref, id) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.curatedRoadmaps}/$id');
  return CuratedRoadmapModel.fromJson(res.data);
});

// All available courses (browse tab)
final allCoursesProvider = FutureProvider<List<CourseModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.availableCourses);
    final list = res.data as List? ?? [];
    return list.map((c) => CourseModel.fromJson(c)).toList();
  } catch (_) {
    return [];
  }
});

// Assessments for student
final studentAssessmentsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.assessments);
    final list = res.data as List? ?? [];
    return list.map((a) => Map<String, dynamic>.from(a)).toList();
  } catch (_) {
    return [];
  }
});

// Recent activity
final recentActivityProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.userActivity);
    final list = res.data as List? ?? [];
    return list.map((a) => Map<String, dynamic>.from(a)).toList();
  } catch (_) {
    return [];
  }
});
