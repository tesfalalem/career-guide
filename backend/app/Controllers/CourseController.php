<?php

require_once __DIR__ . '/../Models/Course.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';
require_once __DIR__ . '/../Services/AiService.php';

class CourseController {
    private $courseModel;
    private $jwtHelper;
    private $aiService;

    public function __construct() {
        $this->courseModel = new Course();
        $this->jwtHelper = new JWTHelper();
        $this->aiService = new AiService();
    }

    public function index() {
        $courses = $this->courseModel->getAll();
        foreach ($courses as &$course) {
            if (isset($course['modules']) && is_string($course['modules'])) {
                $course['modules'] = json_decode($course['modules'], true);
            }
        }
        echo json_encode($courses);
    }

    public function show($id) {
        $course = $this->courseModel->findById($id);
        
        if (!$course) {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
            return;
        }

        echo json_encode($course);
    }

    public function generate() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $role = $data['role'] ?? '';

        if (empty($role)) {
            http_response_code(400);
            echo json_encode(['error' => 'Role is required']);
            return;
        }

        // Generate course structure using Gemini AI
        $courseData = $this->aiService->generateCourse($role);

        if (!$courseData || !isset($courseData['modules'])) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate course. The AI service may be temporarily unavailable. Please try again.']);
            return;
        }

        // Generate full content for every lesson upfront
        $courseTitle = $courseData['title'] ?? $role;
        foreach ($courseData['modules'] as &$module) {
            $moduleTitle = $module['title'] ?? '';
            foreach ($module['lessons'] as &$lesson) {
                if (($lesson['content'] ?? '') === '[CONTENT_PENDING]' || empty($lesson['content'])) {
                    $content = $this->aiService->generateLessonContent(
                        $lesson['title'],
                        $moduleTitle,
                        $courseTitle
                    );
                    $lesson['content'] = $content;
                }
            }
        }

        // Save to database with full content
        $courseId = $this->courseModel->create([
            'title'       => $courseData['title'],
            'description' => $courseData['description'],
            'category'    => $role,
            'level'       => $courseData['level'],
            'modules'     => json_encode($courseData['modules']),
            'duration'    => $courseData['duration'],
            'author'      => 'AI Architect',
            'created_by'  => $user['id']
        ]);

        if ($courseId) {
            // Auto-enroll creator
            $this->courseModel->enroll($courseId, $user['id']);

            $course = $this->courseModel->findById($courseId);

            // Parse modules JSON string back to array for frontend
            if (isset($course['modules']) && is_string($course['modules'])) {
                $course['modules'] = json_decode($course['modules'], true);
            }

            echo json_encode($course);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save course']);
        }
    }

    public function enroll($courseId) {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $result = $this->courseModel->enroll($courseId, $user['id']);

        if ($result) {
            echo json_encode(['message' => 'Enrolled successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to enroll']);
        }
    }

    public function unenroll($courseId) {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $result = $this->courseModel->unenroll($courseId, $user['id']);

        if ($result) {
            echo json_encode(['message' => 'Unenrolled successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to unenroll']);
        }
    }

    public function userCourses() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $courses = $this->courseModel->getUserCourses($user['id']);

        // Parse modules JSON string for each course
        foreach ($courses as &$course) {
            if (isset($course['modules']) && is_string($course['modules'])) {
                $course['modules'] = json_decode($course['modules'], true);
            }
        }

        echo json_encode($courses);
    }

    public function updateProgress($courseId) {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $progress = $data['progress'] ?? 0;
        $completedLessons = $data['completed_lessons'] ?? [];

        $result = $this->courseModel->updateProgress(
            $courseId,
            $user['id'],
            $progress,
            json_encode($completedLessons)
        );

        if ($result) {
            // Update user XP
            $xpGained = count($completedLessons) * 10;
            $this->courseModel->updateUserXP($user['id'], $xpGained);

            echo json_encode([
                'message' => 'Progress updated',
                'xp_gained' => $xpGained
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update progress']);
        }
    }
}
