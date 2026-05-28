import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

// Auth
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/onboarding_screen.dart';
import '../../features/auth/screens/pending_approval_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';

// Student
import '../../features/student/screens/student_shell.dart';
import '../../features/student/screens/student_home_screen.dart';
import '../../features/student/screens/roadmaps_screen.dart';
import '../../features/student/screens/roadmap_detail_screen.dart';
import '../../features/student/screens/courses_screen.dart';
import '../../features/student/screens/course_detail_screen.dart';
import '../../features/student/screens/assessments_screen.dart';
import '../../features/student/screens/assessment_quiz_screen.dart';
import '../../features/student/screens/student_profile_screen.dart';
import '../../features/student/screens/progress_screen.dart';
import '../../features/student/screens/careers_screen.dart';
import '../../features/student/screens/ai_roadmap_generator_screen.dart';
import '../../features/student/screens/ai_course_generator_screen.dart';

// Admin
import '../../features/admin/screens/admin_shell.dart';
import '../../features/admin/screens/admin_home_screen.dart';
import '../../features/admin/screens/admin_users_screen.dart';
import '../../features/admin/screens/admin_approvals_screen.dart';
import '../../features/admin/screens/admin_resources_screen.dart';

// BiT Coordinator
import '../../features/bit/screens/bit_shell.dart';
import '../../features/bit/screens/bit_home_screen.dart';
import '../../features/bit/screens/bit_roadmaps_screen.dart';
import '../../features/bit/screens/bit_courses_screen.dart';

// Shared
import '../../features/shared/screens/notifications_screen.dart';
import '../../features/shared/screens/support_chat_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final user = authState.valueOrNull;
      final location = state.matchedLocation;

      // Splash always redirects — never stays there
      if (location == '/splash') {
        if (user != null) {
          if (user.isPending) return '/pending';
          if (user.isAdmin) return '/admin';
          if (user.isBit) return '/bit';
          return '/student';
        }
        return '/login';
      }

      // Protect routes from unauthenticated access
      if (user == null) {
        if (location.startsWith('/student') ||
            location.startsWith('/admin') ||
            location.startsWith('/bit') ||
            location == '/pending') {
          return '/login';
        }
      }

      // Check account status if authenticated
      if (user != null) {
        if (user.isPending && location != '/pending') {
          return '/pending';
        }
        if (!user.isPending && location == '/pending') {
          if (user.isAdmin) return '/admin';
          if (user.isBit) return '/bit';
          return '/student';
        }

        // Avoid showing login/register to authenticated users
        if (location == '/login' || location == '/register') {
          if (user.isPending) return '/pending';
          if (user.isAdmin) return '/admin';
          if (user.isBit) return '/bit';
          return '/student';
        }

        // Prevent cross-role access
        if (location.startsWith('/admin') && !user.isAdmin) {
          return '/student';
        }
        if (location.startsWith('/bit') && !user.isBit) {
          return '/student';
        }
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(
          path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(
          path: '/pending', builder: (_, __) => const PendingApprovalScreen()),
      GoRoute(
          path: '/forgot-password',
          builder: (_, __) => const ForgotPasswordScreen()),

      // ── Student Shell ──────────────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => StudentShell(child: child),
        routes: [
          GoRoute(
            path: '/student',
            builder: (_, __) => const StudentHomeScreen(),
          ),
          GoRoute(
            path: '/student/roadmaps',
            builder: (_, __) => const RoadmapsScreen(),
            routes: [
              GoRoute(
                path: 'generate',
                builder: (_, __) => const AiRoadmapGeneratorScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (_, state) =>
                    RoadmapDetailScreen(id: state.pathParameters['id']!),
              ),
            ],
          ),
          GoRoute(
            path: '/student/courses',
            builder: (_, __) => const CoursesScreen(),
            routes: [
              GoRoute(
                path: 'generate',
                builder: (_, __) => const AiCourseGeneratorScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (_, state) => CourseDetailScreen(
                  courseId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/student/assessments',
            builder: (_, __) => const AssessmentsScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (_, state) {
                  final extra = state.extra as Map<String, dynamic>?;
                  final title = extra?['title'] ??
                      state.uri.queryParameters['title'] ??
                      'Assessment';
                  return AssessmentQuizScreen(
                    assessmentId: int.parse(state.pathParameters['id']!),
                    title: title,
                  );
                },
              ),
            ],
          ),
          GoRoute(
            path: '/student/profile',
            builder: (_, __) => const StudentProfileScreen(),
          ),
          GoRoute(
            path: '/student/progress',
            builder: (_, __) => const ProgressScreen(),
          ),
          GoRoute(
            path: '/student/careers',
            builder: (_, __) => const CareersScreen(),
          ),
        ],
      ),

      // ── Admin Shell ────────────────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(
            path: '/admin',
            builder: (_, __) => const AdminHomeScreen(),
          ),
          GoRoute(
            path: '/admin/users',
            builder: (_, __) => const AdminUsersScreen(),
          ),
          GoRoute(
            path: '/admin/approvals',
            builder: (_, __) => const AdminApprovalsScreen(),
          ),
          GoRoute(
            path: '/admin/resources',
            builder: (_, __) => const AdminResourcesScreen(),
          ),
        ],
      ),

      // ── BiT Shell ──────────────────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => BitShell(child: child),
        routes: [
          GoRoute(
            path: '/bit',
            builder: (_, __) => const BitHomeScreen(),
          ),
          GoRoute(
            path: '/bit/roadmaps',
            builder: (_, __) => const BitRoadmapsScreen(),
          ),
          GoRoute(
            path: '/bit/courses',
            builder: (_, __) => const BitCoursesScreen(),
          ),
        ],
      ),

      // ── Shared ─────────────────────────────────────────────────────────────
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/support',
        builder: (_, __) => const SupportChatScreen(),
      ),
    ],
  );
});
