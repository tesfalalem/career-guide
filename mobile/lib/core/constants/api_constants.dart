import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000/api'; // Chrome
    }
    return 'http://10.0.2.2:8000/api'; // Android emulator
  }

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh-token';

  // User
  static const String profile = '/users/profile';
  static const String profileImage = '/users/profile/image';
  static const String userStats = '/users/stats';
  static const String userActivity = '/users/activity';
  static const String userCourses = '/users/courses';
  static const String userRoadmaps = '/users/roadmaps';

  // Courses
  static const String courses = '/courses';
  static const String generateCourse = '/courses/generate';

  // Curated Roadmaps
  static const String curatedRoadmaps = '/curated-roadmaps';

  // AI
  static const String careerSuggestion = '/ai/career-suggestion';
  static const String careerDetails = '/ai/career-details';
  static const String lessonContent = '/ai/lesson-content';
  static const String generateAssessment = '/ai/generate-assessment';

  // Assessments
  static const String assessments = '/assessments';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static const String notificationsMarkAllRead = '/notifications/mark-all-read';

  // Teacher
  static const String teacherResources = '/teacher/resources';
  static const String teacherStats = '/teacher/stats';
  static const String teacherStudents = '/teacher/students';
  static const String teacherProfile = '/teacher/profile';
  static const String teacherSettings = '/teacher/settings';
  static const String teacherAnalytics = '/teacher/analytics';

  // Course Assignments
  static const String courseAssignments = '/course-assignments';
  static const String myAssignment = '/course-assignments/my';
  static const String availableCourses = '/course-assignments/available';

  // Admin
  static const String adminAnalytics = '/admin/analytics';
  static const String adminUsers = '/admin/users';
  static const String adminApprovals = '/admin/approvals/pending';
  static const String adminResources = '/admin/resources';

  // BiT
  static const String bitRoadmaps = '/bit/roadmaps';
  static const String bitCourses = '/bit/courses';
  static const String bitAnalytics = '/bit/analytics';

  // Resources (public)
  static const String resources = '/resources';

  // Support
  static const String supportMessages = '/support/messages';

  // Public
  static const String publicStats = '/stats';
}
