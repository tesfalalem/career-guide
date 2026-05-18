import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // ── Base URL ───────────────────────────────────────────────────────────────
  //
  // The backend runs on XAMPP Apache (port 80) at:
  //   http://<host>/careerguide/backend/api
  //
  // • Web (Chrome dev)      → localhost
  // • Android emulator      → 10.0.2.2  (maps to host machine's localhost)
  // • Physical Android device → use your machine's LAN IP, e.g. 192.168.x.x
  //
  // To use a physical device, change _physicalDeviceIp to your PC's local IP.
  // Find it with: ipconfig (Windows) → "IPv4 Address" under your Wi-Fi adapter.

  static const String _physicalDeviceIp =
      '10.187.1.1'; // ← change to your PC's LAN IP

  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost/careerguide/backend/api';
    }
    // Android emulator uses 10.0.2.2 to reach host machine
    // Physical device needs the actual LAN IP
    const emulatorHost = '10.0.2.2';
    return 'http://$emulatorHost/careerguide/backend/api';
  }

  /// Use this URL when running on a physical device connected to the same Wi-Fi.
  /// Call ApiConstants.physicalDeviceUrl instead of baseUrl in that case.
  static String get physicalDeviceUrl {
    return 'http://$_physicalDeviceIp/careerguide/backend/api';
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh-token';

  // ── User ───────────────────────────────────────────────────────────────────
  static const String profile = '/users/profile';
  static const String profileImage = '/users/profile/image';
  static const String userStats = '/users/stats';
  static const String userActivity = '/users/activity';
  static const String userCourses = '/users/courses';
  static const String userRoadmaps = '/users/roadmaps';

  // ── Courses ────────────────────────────────────────────────────────────────
  static const String courses = '/courses';
  static const String generateCourse = '/courses/generate';
  static String courseEnroll(String id) => '/courses/$id/enroll';
  static String courseUnenroll(String id) => '/courses/$id/unenroll';

  // ── Curated Roadmaps ───────────────────────────────────────────────────────
  static const String curatedRoadmaps = '/curated-roadmaps';
  static const String generateRoadmap = '/roadmaps/generate';
  static const String roadmaps = '/roadmaps';

  // ── Careers (public) ──────────────────────────────────────────────────────
  static const String careers = '/careers';
  static const String careerCategories = '/careers/categories';

  // ── AI ─────────────────────────────────────────────────────────────────────
  static const String careerSuggestion = '/ai/career-suggestion';
  static const String careerDetails = '/ai/career-details';
  static const String lessonContent = '/ai/lesson-content';
  static const String generateAssessment = '/ai/generate-assessment';

  // ── Assessments ────────────────────────────────────────────────────────────
  static const String assessments = '/assessments';

  // ── Notifications ──────────────────────────────────────────────────────────
  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static const String notificationsMarkAllRead = '/notifications/mark-all-read';

  // ── Teacher ────────────────────────────────────────────────────────────────
  static const String teacherResources = '/teacher/resources';
  static const String teacherStats = '/teacher/stats';
  static const String teacherStudents = '/teacher/students';
  static const String teacherProfile = '/teacher/profile';
  static const String teacherSettings = '/teacher/settings';
  static const String teacherAnalytics = '/teacher/analytics';

  // ── Course Assignments ─────────────────────────────────────────────────────
  static const String courseAssignments = '/course-assignments';
  static const String myAssignment = '/course-assignments/my';
  static const String availableCourses = '/course-assignments/available';

  // ── Admin ──────────────────────────────────────────────────────────────────
  static const String adminAnalytics = '/admin/analytics';
  static const String adminUsers = '/admin/users';
  static const String adminApprovals = '/admin/approvals/pending';
  static const String adminResources = '/admin/resources';

  // ── BiT ────────────────────────────────────────────────────────────────────
  static const String bitRoadmaps = '/bit/roadmaps';
  static const String bitCourses = '/bit/courses';
  static const String bitAnalytics = '/bit/analytics';
  static const String bitCareers = '/bit/careers';

  // ── Resources (public) ────────────────────────────────────────────────────
  static const String resources = '/resources';

  // ── Support ────────────────────────────────────────────────────────────────
  static const String supportMessages = '/support/messages';

  // ── Public ─────────────────────────────────────────────────────────────────
  static const String publicStats = '/stats';
}
