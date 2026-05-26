<?php

class Router {
    private $routes = [];

    public function __construct() {
        $this->defineRoutes();
    }

    private function defineRoutes() {
        // Authentication Routes
        $this->routes['POST']['/api/auth/register'] = 'AuthController@register';
        $this->routes['POST']['/api/auth/login'] = 'AuthController@login';
        $this->routes['POST']['/api/auth/logout'] = 'AuthController@logout';
        $this->routes['POST']['/api/auth/refresh-token'] = 'AuthController@refreshToken';
        $this->routes['GET']['/api/auth/oauth/google'] = 'AuthController@googleOAuth';
        $this->routes['GET']['/api/auth/oauth/github'] = 'AuthController@githubOAuth';

        // User Routes
        $this->routes['GET']['/api/users/profile'] = 'UserController@getProfile';
        $this->routes['PUT']['/api/users/profile'] = 'UserController@updateProfile';
        $this->routes['POST']['/api/users/profile/image'] = 'UserController@updateProfileImage';
        $this->routes['DELETE']['/api/users/profile/image'] = 'UserController@deleteProfileImage';
        $this->routes['GET']['/api/users/stats'] = 'UserController@getStats';
        $this->routes['GET']['/api/users/activity'] = 'UserController@getActivity';

        // Course Routes
        // NOTE: static sub-paths must come BEFORE dynamic /:id to avoid shadowing in matchDynamicRoute
        $this->routes['GET']['/api/courses'] = 'CourseController@index';
        $this->routes['POST']['/api/courses/generate'] = 'CourseController@generate';
        $this->routes['GET']['/api/users/courses'] = 'CourseController@userCourses';
        $this->routes['GET']['/api/courses/:id'] = 'CourseController@show';
        $this->routes['POST']['/api/courses/:id/enroll'] = 'CourseController@enroll';
        $this->routes['DELETE']['/api/courses/:id/unenroll'] = 'CourseController@unenroll';
        $this->routes['PUT']['/api/courses/:id/progress'] = 'CourseController@updateProgress';

        // Roadmap Routes
        $this->routes['POST']['/api/roadmaps/generate'] = 'RoadmapController@generate';
        $this->routes['POST']['/api/roadmaps'] = 'RoadmapController@save';
        $this->routes['GET']['/api/users/roadmaps'] = 'RoadmapController@userRoadmaps';
        $this->routes['DELETE']['/api/roadmaps/:id'] = 'RoadmapController@delete';

        // AI Routes
        $this->routes['POST']['/api/ai/career-suggestion'] = 'AIController@careerSuggestion';
        $this->routes['POST']['/api/ai/career-details'] = 'AIController@generateCareerDetails';
        $this->routes['POST']['/api/ai/quiz-evaluate'] = 'AIController@evaluateQuiz';
        $this->routes['POST']['/api/ai/lesson-content'] = 'AIController@generateLessonContent';
        $this->routes['POST']['/api/ai/generate-assessment'] = 'AIController@generateAssessment';

        // BiT Dashboard ÔÇö Roadmap & Course Management (role: bit only)
        $this->routes['POST']['/api/bit/roadmaps'] = 'BitController@createRoadmap';
        $this->routes['GET']['/api/bit/roadmaps'] = 'BitController@getRoadmaps';
        $this->routes['GET']['/api/bit/roadmaps/:id'] = 'BitController@getRoadmap';
        $this->routes['PUT']['/api/bit/roadmaps/:id'] = 'BitController@updateRoadmap';
        $this->routes['DELETE']['/api/bit/roadmaps/:id'] = 'BitController@deleteRoadmap';
        $this->routes['POST']['/api/bit/roadmaps/:id/publish'] = 'BitController@publishRoadmap';
        $this->routes['POST']['/api/bit/roadmaps/:id/course'] = 'BitController@addCourseToRoadmap';
        $this->routes['GET']['/api/bit/courses'] = 'BitController@getCourses';
        $this->routes['POST']['/api/bit/courses/standalone'] = 'BitController@createStandaloneCourse';
        $this->routes['GET']['/api/bit/courses/:id'] = 'BitController@getCourse';
        $this->routes['PUT']['/api/bit/courses/:id'] = 'BitController@updateCourse';
        $this->routes['DELETE']['/api/bit/courses/:id'] = 'BitController@deleteCourse';
        $this->routes['GET']['/api/bit/analytics'] = 'BitController@getAnalytics';

        // Admin Resource Management (moderation only — no roadmap/course creation)
        // NOTE: static routes must be registered BEFORE dynamic /:id routes to avoid shadowing
        $this->routes['POST']['/api/admin/resources'] = 'AdminController@createResource';
        $this->routes['GET']['/api/admin/resources'] = 'AdminController@getResources';
        $this->routes['GET']['/api/admin/resources/pending'] = 'AdminController@getPendingResources';
        $this->routes['PUT']['/api/admin/resources/:id'] = 'AdminController@updateResource';
        $this->routes['DELETE']['/api/admin/resources/:id'] = 'AdminController@deleteResource';
        $this->routes['POST']['/api/admin/resources/:id/approve'] = 'AdminController@approveResource';
        $this->routes['POST']['/api/admin/resources/:id/reject'] = 'AdminController@rejectResource';

        // Admin User Management
        $this->routes['GET']['/api/admin/users'] = 'AdminController@getAllUsers';
        $this->routes['PUT']['/api/admin/users/:id/role'] = 'AdminController@updateUserRole';
        
        // Admin Role Approval Management
        $this->routes['GET']['/api/admin/approvals/pending'] = 'AdminController@getPendingApprovals';
        $this->routes['POST']['/api/admin/approvals/:id/approve'] = 'AdminController@approveRoleRequest';
        $this->routes['POST']['/api/admin/approvals/:id/reject'] = 'AdminController@rejectRoleRequest';

        // Admin Analytics
        $this->routes['GET']['/api/admin/analytics'] = 'AdminController@getAnalytics';

        // Public Curated Roadmaps (for students)
        // NOTE: static routes must be registered BEFORE dynamic /:id routes to avoid shadowing
        $this->routes['GET']['/api/curated-roadmaps'] = 'CuratedRoadmapController@browse';
        $this->routes['GET']['/api/curated-roadmaps/categories'] = 'CuratedRoadmapController@getCategories';
        $this->routes['GET']['/api/curated-roadmaps/:id'] = 'CuratedRoadmapController@view';
        $this->routes['POST']['/api/curated-roadmaps/:id/enroll'] = 'CuratedRoadmapController@enroll';
        $this->routes['GET']['/api/curated-roadmaps/:id/resources'] = 'CuratedRoadmapController@getResources';
        $this->routes['GET']['/api/curated-roadmaps/:id/courses'] = 'CuratedRoadmapController@getCourses';

        // Public Resources (for students)
        $this->routes['GET']['/api/resources'] = 'ResourceController@browse';
        $this->routes['GET']['/api/resources/course/:id'] = 'ResourceController@getCourseTeacherResources';
        $this->routes['GET']['/api/resources/:id'] = 'ResourceController@view';
        $this->routes['POST']['/api/resources/:id/download'] = 'ResourceController@download';

        // Teacher Resource Management
        // NOTE: static sub-paths must come BEFORE dynamic /:id to avoid shadowing in matchDynamicRoute
        $this->routes['GET']['/api/teacher/resources'] = 'ResourceController@getMyResources';
        $this->routes['GET']['/api/teacher/resources/stats'] = 'ResourceController@getStats';
        $this->routes['POST']['/api/teacher/resources'] = 'ResourceController@create';
        $this->routes['PUT']['/api/teacher/resources/:id'] = 'ResourceController@update';
        $this->routes['DELETE']['/api/teacher/resources/:id'] = 'ResourceController@delete';
        
        // Resource-Roadmap Matching
        $this->routes['GET']['/api/resources/:id/roadmaps'] = 'ResourceController@getMatchedRoadmaps';
        $this->routes['POST']['/api/resources/:id/auto-match'] = 'ResourceController@triggerAutoMatch';
        
        // Student Monitoring System
        $this->routes['GET']['/api/teacher/students'] = 'StudentMonitoringController@getMyStudents';
        $this->routes['GET']['/api/teacher/students/:id/progress'] = 'StudentMonitoringController@getStudentProgress';
        $this->routes['POST']['/api/teacher/feedback'] = 'StudentMonitoringController@sendFeedback';
        $this->routes['GET']['/api/teacher/feedback/:studentId'] = 'StudentMonitoringController@getFeedbackHistory';
        $this->routes['GET']['/api/feedback/unread'] = 'StudentMonitoringController@getUnreadCount';
        
        // Student Progress Tracking
        $this->routes['POST']['/api/student/track-access'] = 'StudentMonitoringController@trackAccess';
        $this->routes['POST']['/api/student/rate-resource'] = 'StudentMonitoringController@rateResource';
        
        // Teacher Analytics
        $this->routes['GET']['/api/teacher/analytics'] = 'AnalyticsController@getTeacherAnalytics';
        $this->routes['GET']['/api/teacher/analytics/resource/:id'] = 'AnalyticsController@getResourceAnalytics';
        
        // Teacher Dashboard & Profile
        $this->routes['GET']['/api/teacher/stats'] = 'TeacherController@getStats';
        $this->routes['GET']['/api/teacher/activity'] = 'TeacherController@getActivity';
        $this->routes['GET']['/api/teacher/at-risk-students'] = 'TeacherController@getAtRiskStudents';
        $this->routes['GET']['/api/teacher/profile'] = 'TeacherController@getProfile';
        $this->routes['PUT']['/api/teacher/profile'] = 'TeacherController@updateProfile';
        $this->routes['GET']['/api/teacher/settings'] = 'TeacherController@getSettings';
        $this->routes['PUT']['/api/teacher/settings'] = 'TeacherController@updateSettings';
        
        // Course Assignment System
        // NOTE: static sub-paths must come BEFORE dynamic /:id to avoid shadowing in matchDynamicRoute
        $this->routes['POST']['/api/course-assignments/request'] = 'CourseAssignmentController@requestAssignment';
        $this->routes['POST']['/api/course-assignments/request-multiple'] = 'CourseAssignmentController@requestMultipleAssignments';
        $this->routes['POST']['/api/course-assignments/enroll'] = 'CourseAssignmentController@studentEnroll';
        $this->routes['GET']['/api/course-assignments/my'] = 'CourseAssignmentController@getMyAssignment';
        $this->routes['GET']['/api/course-assignments/approved'] = 'CourseAssignmentController@getApprovedAssignments';
        $this->routes['GET']['/api/course-assignments/pending'] = 'CourseAssignmentController@getPendingAssignments';
        $this->routes['GET']['/api/course-assignments/all'] = 'CourseAssignmentController@getAllAssignments';
        $this->routes['GET']['/api/course-assignments/available'] = 'CourseAssignmentController@getAvailableCourses';
        $this->routes['GET']['/api/course-assignments/available-bit'] = 'CourseAssignmentController@getBitCourses';
        $this->routes['GET']['/api/course-assignments/my-students'] = 'CourseAssignmentController@getMyStudents';
        $this->routes['POST']['/api/course-assignments/:id/approve'] = 'CourseAssignmentController@approveAssignment';
        $this->routes['POST']['/api/course-assignments/:id/reject'] = 'CourseAssignmentController@rejectAssignment';

        // Teacher Course-Specific Materials Management
        $this->routes['GET']['/api/teacher/courses/:id/materials'] = 'ResourceController@getCourseMaterials';
        $this->routes['POST']['/api/teacher/courses/:id/materials'] = 'ResourceController@createCourseMaterial';
        $this->routes['PUT']['/api/teacher/materials/:id'] = 'ResourceController@updateCourseMaterial';
        $this->routes['DELETE']['/api/teacher/materials/:id'] = 'ResourceController@deleteCourseMaterial';
        $this->routes['GET']['/api/courses/:id/teacher-materials'] = 'ResourceController@getStudentCourseMaterials';

        // File Upload & Serve (for course content blocks)
        $this->routes['POST']['/api/upload'] = 'UploadController@upload';
        $this->routes['GET']['/api/uploads/serve'] = 'UploadController@serve';

        // Careers — BiT Admin (CRUD + publish/unpublish)
        $this->routes['GET']['/api/bit/careers']              = 'CareersController@index';
        $this->routes['POST']['/api/bit/careers']             = 'CareersController@create';
        $this->routes['GET']['/api/bit/careers/:id']          = 'CareersController@show';
        $this->routes['PUT']['/api/bit/careers/:id']          = 'CareersController@update';
        $this->routes['DELETE']['/api/bit/careers/:id']       = 'CareersController@delete';
        $this->routes['POST']['/api/bit/careers/:id/publish']   = 'CareersController@publish';
        $this->routes['POST']['/api/bit/careers/:id/unpublish'] = 'CareersController@unpublish';

        // Careers — Public (students, published only)
        // NOTE: static routes must be registered BEFORE dynamic /:id routes to avoid shadowing
        $this->routes['GET']['/api/careers']             = 'CareersController@publicIndex';
        $this->routes['GET']['/api/careers/categories']  = 'CareersController@publicCategories';
        $this->routes['GET']['/api/careers/:id']         = 'CareersController@publicShow';


        // Assessment Routes
        // NOTE: static sub-paths must come BEFORE dynamic /:id to avoid shadowing in matchDynamicRoute
        $this->routes['POST']['/api/assessments'] = 'AssessmentController@create';
        $this->routes['GET']['/api/assessments'] = 'AssessmentController@getForStudent';
        $this->routes['GET']['/api/assessments/course/:id'] = 'AssessmentController@getByCourse';
        $this->routes['GET']['/api/assessments/:id/questions-admin'] = 'AssessmentController@getQuestionsAdmin';
        $this->routes['GET']['/api/assessments/:id'] = 'AssessmentController@getById';
        $this->routes['POST']['/api/assessments/:id/submit'] = 'AssessmentController@submit';
        $this->routes['DELETE']['/api/assessments/:id'] = 'AssessmentController@delete';

        // Notification Routes
        // NOTE: static sub-paths must come BEFORE dynamic /:id to avoid shadowing in matchDynamicRoute
        $this->routes['GET']['/api/notifications'] = 'NotificationController@getNotifications';
        $this->routes['GET']['/api/notifications/unread-count'] = 'NotificationController@getUnreadCount';
        $this->routes['GET']['/api/notifications/preferences'] = 'NotificationController@getPreferences';
        $this->routes['PUT']['/api/notifications/mark-all-read'] = 'NotificationController@markAllAsRead';
        $this->routes['PUT']['/api/notifications/preferences'] = 'NotificationController@updatePreferences';
        $this->routes['PUT']['/api/notifications/:id/read'] = 'NotificationController@markAsRead';
        $this->routes['DELETE']['/api/notifications/:id'] = 'NotificationController@deleteNotification';

        // Support Chat Routes
        $this->routes['GET']['/api/support/messages'] = 'SupportController@getMessages';
        $this->routes['POST']['/api/support/messages'] = 'SupportController@sendMessage';
        $this->routes['GET']['/api/admin/support/conversations'] = 'SupportController@getAdminConversations';
        $this->routes['GET']['/api/admin/support/messages/:userId'] = 'SupportController@getAdminMessages';
        $this->routes['DELETE']['/api/admin/support/messages/:id'] = 'SupportController@deleteMessage';
        $this->routes['GET']['/api/public/support/messages/:guestId'] = 'SupportController@getGuestMessages';
        $this->routes['POST']['/api/public/support/messages'] = 'SupportController@sendGuestMessage';

        // Public Statistics
        $this->routes['GET']['/api/stats'] = 'PublicController@getStats';
    }

    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $fullUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        $apiPos = strpos($fullUri, '/api');
        $uri = ($apiPos !== false) ? substr($fullUri, $apiPos) : $fullUri;

        // 1. Try exact static match first
        if (isset($this->routes[$method][$uri])) {
            $this->callController($this->routes[$method][$uri]);
            return;
        }

        // 2. Try dynamic routes — but skip routes that have no parameters (no colon)
        //    to avoid matching a static-looking path against a dynamic pattern
        $this->matchDynamicRoute($method, $uri);
    }

    private function matchDynamicRoute($method, $uri) {
        // Separate routes into static (no params) and dynamic (has params)
        // Try dynamic routes only — static ones were already checked in dispatch()
        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            // Skip routes with no parameters — they were already checked as exact matches
            if (strpos($route, ':') === false) continue;

            $pattern = preg_replace('/:\w+/', '([^/]+)', $route);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                $this->callController($handler, $matches);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }

    private function callController($handler, $params = []) {
        list($controller, $method) = explode('@', $handler);
        $controllerFile = __DIR__ . '/../app/Controllers/' . $controller . '.php';

        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            
            // Get database connection
            global $db;
            
            // Controllers that need database connection
            $controllersNeedingDb = [
                'NotificationController',
                'StudentMonitoringController',
                'AnalyticsController',
                'TeacherController'
            ];
            
            // Instantiate controller with or without database
            if (in_array($controller, $controllersNeedingDb)) {
                $controllerClass = "App\\Controllers\\{$controller}";
                $controllerInstance = new $controllerClass($db);
            } else {
                $controllerInstance = new $controller();
            }
            
            call_user_func_array([$controllerInstance, $method], $params);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Controller not found']);
        }
    }
}
