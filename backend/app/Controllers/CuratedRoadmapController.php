<?php

require_once __DIR__ . '/../Models/CuratedRoadmap.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class CuratedRoadmapController {
    private $roadmapModel;
    private $jwtHelper;

    public function __construct() {
        $this->roadmapModel = new CuratedRoadmap();
        $this->jwtHelper = new JWTHelper();
    }

    private function getCurrentUser() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

        $decoded = $this->jwtHelper->validateToken($token);
        if (!$decoded) {
            return null;
        }

        $userModel = new User();
        return $userModel->findById($decoded->user_id);
    }

    // Browse published roadmaps (public)
    public function browse() {
        $filters = [
            'status' => 'published',
            'category' => $_GET['category'] ?? null,
            'difficulty_level' => $_GET['difficulty_level'] ?? null,
            'search' => $_GET['search'] ?? null,
            'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : 20,
            'offset' => isset($_GET['offset']) ? (int)$_GET['offset'] : 0
        ];

        $filters = array_filter($filters, function($value) {
            return $value !== null;
        });

        $roadmaps = $this->roadmapModel->getAll($filters);

        // Decode JSON fields
        foreach ($roadmaps as &$roadmap) {
            $roadmap['tags'] = json_decode($roadmap['tags'] ?? '[]', true);
            $roadmap['phases'] = json_decode($roadmap['phases'] ?? '[]', true);
        }

        echo json_encode($roadmaps);
    }

    // View single roadmap
    public function view($id) {
        $roadmap = $this->roadmapModel->getById($id);

        if (!$roadmap || $roadmap['status'] !== 'published') {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        // Increment views
        $this->roadmapModel->incrementViews($id);

        $roadmap['tags'] = json_decode($roadmap['tags'] ?? '[]', true);
        $roadmap['phases'] = json_decode($roadmap['phases'] ?? '[]', true);

        echo json_encode($roadmap);
    }

    // Enroll in roadmap
    public function enroll($id) {
        $user = $this->getCurrentUser();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            return;
        }

        $roadmap = $this->roadmapModel->getById($id);

        if (!$roadmap || $roadmap['status'] !== 'published') {
            http_response_code(404);
            echo json_encode(['error' => 'Roadmap not found']);
            return;
        }

        // Create enrollment
        $database = new Database();
        $conn = $database->getConnection();

        $query = "INSERT INTO roadmap_enrollments (user_id, roadmap_id, status) 
                  VALUES (:user_id, :roadmap_id, 'active')
                  ON DUPLICATE KEY UPDATE status = 'active'";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->bindParam(':roadmap_id', $id);

        if ($stmt->execute()) {
            // Check if it was a new enrollment or existing
            $wasInserted = $conn->lastInsertId() > 0;
            $this->roadmapModel->incrementEnrollments($id);

            if ($wasInserted) {
                echo json_encode(['message' => 'Enrolled successfully', 'status' => 'enrolled']);
            } else {
                http_response_code(409);
                echo json_encode(['message' => 'Already enrolled', 'status' => 'already_enrolled']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to enroll']);
        }
    }

    // Get categories
    public function getCategories() {
        $categories = $this->roadmapModel->getCategories();
        echo json_encode($categories);
    }

    // Get courses linked to a roadmap
    public function getCourses($roadmapId) {
        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("
            SELECT c.id, c.title, c.description, c.category, c.level,
                   c.duration, c.rating, c.enrolled_count, c.author,
                   u.name as creator_name
            FROM roadmap_courses rc
            JOIN courses c ON rc.course_id = c.id
            LEFT JOIN users u ON c.created_by = u.id
            WHERE rc.roadmap_id = ?
            ORDER BY rc.id ASC
        ");
        $stmt->execute([$roadmapId]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // Get resources linked to a roadmap
    public function getResources($roadmapId) {
        try {
            $database = new Database();
            $conn = $database->getConnection();

            $query = "
                SELECT 
                    er.id,
                    er.title,
                    er.description,
                    er.resource_type,
                    er.file_path,
                    er.external_url,
                    er.category,
                    er.views,
                    er.downloads,
                    rr.phase_index,
                    rr.topic_index,
                    rr.display_order,
                    rr.auto_matched,
                    rr.match_score,
                    u.name as uploaded_by_name
                FROM roadmap_resources rr
                JOIN educational_resources er ON rr.resource_id = er.id
                LEFT JOIN users u ON er.uploaded_by = u.id
                WHERE rr.roadmap_id = :roadmap_id 
                AND er.status = 'approved'
                ORDER BY rr.phase_index, rr.topic_index, rr.display_order
            ";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':roadmap_id', $roadmapId);
            $stmt->execute();

            $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by phase
            $grouped = [];
            foreach ($resources as $resource) {
                $phaseIndex = $resource['phase_index'];
                if (!isset($grouped[$phaseIndex])) {
                    $grouped[$phaseIndex] = [];
                }
                $grouped[$phaseIndex][] = $resource;
            }

            echo json_encode([
                'success' => true,
                'resources' => $resources,
                'grouped_by_phase' => $grouped,
                'total' => count($resources)
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch resources']);
        }
    }
}
