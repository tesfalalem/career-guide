<?php

require_once __DIR__ . '/../Models/CuratedRoadmap.php';
require_once __DIR__ . '/../Models/EducationalResource.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class BitController {
    private $roadmapModel;
    private $resourceModel;
    private $userModel;
    private $jwtHelper;

    public function __construct() {
        $this->roadmapModel = new CuratedRoadmap();
        $this->resourceModel = new EducationalResource();
        $this->userModel = new User();
        $this->jwtHelper = new JWTHelper();
    }

    private function checkPermission() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $decoded = $this->jwtHelper->validateToken($token);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }

        $user = $this->userModel->findById($decoded->user_id);

        if (!$user || $user['role'] !== 'bit') {
            http_response_code(403);
            echo json_encode(['error' => 'BiT access required']);
            exit();
        }

        return $user;
    }

    // ==================== ROADMAP MANAGEMENT ====================

    public function createRoadmap() {
        $user = $this->checkPermission();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['title']) || !isset($data['phases'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and phases are required']);
            return;
        }

        $roadmapData = [
            'title'              => $data['title'],
            'description'        => $data['description'] ?? '',
            'category'           => $data['category'] ?? 'General',
            'difficulty_level'   => $data['difficulty_level'] ?? 'beginner',
            'estimated_duration' => $data['estimated_duration'] ?? '',
            'created_by'         => $user['id'],
            'status'             => $data['status'] ?? 'published',
            'tags'               => json_encode($data['tags'] ?? []),
            'phases'             => json_encode($data['phases']),
            'thumbnail_url'      => $data['thumbnail_url'] ?? null
        ];

        $roadmapId = $this->roadmapModel->create($roadmapData);

        if ($roadmapId) {
            http_response_code(201);
            echo json_encode(['message' => 'Roadmap created successfully', 'roadmap_id' => $roadmapId]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create roadmap']);
        }
    }

    public function getRoadmaps() {
        $this->checkPermission();

        $filters = array_filter([
            'status'           => $_GET['status'] ?? null,
            'category'         => $_GET['category'] ?? null,
            'difficulty_level' => $_GET['difficulty_level'] ?? null,
            'search'           => $_GET['search'] ?? null,
            'limit'            => isset($_GET['limit']) ? (int)$_GET['limit'] : 50,
            'offset'           => isset($_GET['offset']) ? (int)$_GET['offset'] : 0,
        ], fn($v) => $v !== null);

        $roadmaps = $this->roadmapModel->getAll($filters);

        foreach ($roadmaps as &$roadmap) {
            $roadmap['tags']   = json_decode($roadmap['tags'] ?? '[]', true);
            $roadmap['phases'] = json_decode($roadmap['phases'] ?? '[]', true);
        }

        echo json_encode($roadmaps);
    }

    public function getRoadmap($id) {
        $this->checkPermission();

        $roadmap = $this->roadmapModel->getById($id);
        if (!$roadmap) {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        $roadmap['tags']   = json_decode($roadmap['tags'] ?? '[]', true);
        $roadmap['phases'] = json_decode($roadmap['phases'] ?? '[]', true);
        echo json_encode($roadmap);
    }

    public function updateRoadmap($id) {
        $this->checkPermission();
        $data = json_decode(file_get_contents("php://input"), true);

        $roadmap = $this->roadmapModel->getById($id);
        if (!$roadmap) {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        $updateData = [];
        foreach (['title','description','category','difficulty_level','estimated_duration','status','thumbnail_url'] as $f) {
            if (isset($data[$f])) $updateData[$f] = $data[$f];
        }
        if (isset($data['tags']))   $updateData['tags']   = json_encode($data['tags']);
        if (isset($data['phases'])) $updateData['phases'] = json_encode($data['phases']);

        if ($this->roadmapModel->update($id, $updateData)) {
            echo json_encode(['message' => 'Roadmap updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update roadmap']);
        }
    }

    public function deleteRoadmap($id) {
        $this->checkPermission();

        if (!$this->roadmapModel->getById($id)) {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        if ($this->roadmapModel->delete($id)) {
            echo json_encode(['message' => 'Roadmap deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete roadmap']);
        }
    }

    public function publishRoadmap($id) {
        $this->checkPermission();

        $roadmap = $this->roadmapModel->getById($id);
        if (!$roadmap) {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        if ($this->roadmapModel->update($id, ['status' => 'published'])) {
            $database = new Database();
            $conn = $database->getConnection();

            $students = $conn->query(
                "SELECT id FROM users WHERE role = 'student' AND (account_status = 'active' OR account_status IS NULL)"
            )->fetchAll(PDO::FETCH_ASSOC);

            foreach ($students as $student) {
                $conn->prepare("INSERT IGNORE INTO roadmap_enrollments (user_id, roadmap_id, status) VALUES (?, ?, 'active')")
                     ->execute([$student['id'], $id]);

                $conn->prepare("INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, 'new_roadmap', ?, ?, ?)")
                     ->execute([
                         $student['id'],
                         'New Roadmap: ' . $roadmap['title'],
                         'A new BiT roadmap "' . $roadmap['title'] . '" has been published.',
                         '/roadmaps'
                     ]);
            }

            $conn->prepare("UPDATE curated_roadmaps SET enrollments = (SELECT COUNT(*) FROM roadmap_enrollments WHERE roadmap_id = ?) WHERE id = ?")
                 ->execute([$id, $id]);

            echo json_encode(['message' => 'Roadmap published successfully', 'enrolled_count' => count($students)]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to publish roadmap']);
        }
    }

    // ==================== COURSE MANAGEMENT ====================

    public function addCourseToRoadmap($roadmapId) {
        $user = $this->checkPermission();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['title']) || !isset($data['modules']) || empty($data['modules'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Course title and at least one module are required']);
            return;
        }

        $roadmap = $this->roadmapModel->getById($roadmapId);
        if (!$roadmap) {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("
            INSERT INTO courses (title, description, category, level, modules, duration, author, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? '',
            $roadmap['category'] ?? 'General',
            $data['level'] ?? 'Intermediate',
            json_encode($data['modules']),
            $data['duration'] ?? '',
            $user['name'],
            $user['id']
        ]);
        $courseId = $conn->lastInsertId();

        if (!$courseId) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save course']);
            return;
        }

        // Link course to roadmap
        $conn->prepare("
            CREATE TABLE IF NOT EXISTS roadmap_courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                roadmap_id INT NOT NULL,
                course_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_link (roadmap_id, course_id),
                FOREIGN KEY (roadmap_id) REFERENCES curated_roadmaps(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ")->execute();

        $conn->prepare("INSERT IGNORE INTO roadmap_courses (roadmap_id, course_id) VALUES (?, ?)")
            ->execute([$roadmapId, $courseId]);

        // Enroll all active students
        $students = $conn->query(
            "SELECT id FROM users WHERE role = 'student' AND (account_status = 'active' OR account_status IS NULL)"
        )->fetchAll(PDO::FETCH_ASSOC);

        foreach ($students as $student) {
            $sid = $student['id'];

            if ($roadmap['status'] === 'published') {
                $conn->prepare("INSERT IGNORE INTO roadmap_enrollments (user_id, roadmap_id, status) VALUES (?, ?, 'active')")
                     ->execute([$sid, $roadmapId]);
            }

            $conn->prepare("INSERT IGNORE INTO course_enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, NOW())")
                 ->execute([$sid, $courseId]);

            $conn->prepare("INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, 'new_resource', ?, ?, '/courses')")
                 ->execute([
                     $sid,
                     'New Course: ' . $data['title'],
                     'A new BiT course "' . $data['title'] . '" has been added to your Courses.'
                 ]);
        }

        http_response_code(201);
        echo json_encode([
            'message'       => 'Course created and assigned to all students',
            'course_id'     => $courseId,
            'enrolled_count'=> count($students)
        ]);
    }

    // Create a standalone course (not linked to a roadmap)
    public function createStandaloneCourse() {
        $user = $this->checkPermission();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['title']) || empty($data['modules'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Course title and at least one module are required']);
            return;
        }

        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("
            INSERT INTO courses (title, description, category, level, modules, duration, author, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? '',
            $data['category'] ?? 'General',
            $data['level'] ?? 'Intermediate',
            json_encode($data['modules']),
            $data['duration'] ?? '',
            $user['name'],
            $user['id']
        ]);
        $courseId = $conn->lastInsertId();

        if (!$courseId) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save course']);
            return;
        }

        // Enroll all active students
        $students = $conn->query("
            SELECT id FROM users WHERE role = 'student' AND (account_status = 'active' OR account_status IS NULL)
        ")->fetchAll(PDO::FETCH_ASSOC);

        foreach ($students as $student) {
            $conn->prepare("INSERT IGNORE INTO course_enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, NOW())")
                 ->execute([$student['id'], $courseId]);
            $conn->prepare("INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, 'new_resource', ?, ?, '/courses')")
                 ->execute([$student['id'], 'New Course: ' . $data['title'], 'A new BiT course "' . $data['title'] . '" has been added.']);
        }

        http_response_code(201);
        echo json_encode([
            'message'        => 'Course created and assigned to all students',
            'course_id'      => $courseId,
            'enrolled_count' => count($students)
        ]);
    }

    public function getCourses() {        $this->checkPermission();

        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->query("
            SELECT c.*, u.name as creator_name
            FROM courses c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC
            LIMIT 100
        ");

        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($courses as &$course) {
            $course['modules'] = json_decode($course['modules'] ?? '[]', true);
        }

        echo json_encode($courses);
    }

    public function deleteCourse($id) {
        $this->checkPermission();

        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("SELECT id FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
            return;
        }

        $conn->prepare("DELETE FROM courses WHERE id = ?")->execute([$id]);
        echo json_encode(['message' => 'Course deleted successfully']);
    }

    // ==================== ANALYTICS ====================

    public function getAnalytics() {
        $this->checkPermission();

        $database = new Database();
        $conn = $database->getConnection();

        $stats = [];

        $stats['total_roadmaps']    = $conn->query("SELECT COUNT(*) FROM curated_roadmaps")->fetchColumn();
        $stats['published_roadmaps']= $conn->query("SELECT COUNT(*) FROM curated_roadmaps WHERE status='published'")->fetchColumn();
        $stats['draft_roadmaps']    = $conn->query("SELECT COUNT(*) FROM curated_roadmaps WHERE status='draft'")->fetchColumn();
        $stats['total_courses']     = $conn->query("SELECT COUNT(*) FROM courses")->fetchColumn();
        $stats['total_enrollments'] = $conn->query("SELECT COUNT(*) FROM course_enrollments")->fetchColumn();
        $stats['total_students']    = $conn->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();

        $stats['popular_roadmaps']  = $this->roadmapModel->getPopular(5);

        $stats['recent_courses'] = $conn->query("
            SELECT c.id, c.title, c.level, c.enrolled_count, c.created_at, u.name as creator_name
            FROM courses c LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($stats);
    }
}
