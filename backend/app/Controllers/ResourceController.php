<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/EducationalResource.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class ResourceController {
    private $resourceModel;
    private $jwtHelper;
    private $uploadDir;

    public function __construct() {
        $this->resourceModel = new EducationalResource();
        $this->jwtHelper = new JWTHelper();
        $this->uploadDir = __DIR__ . '/../../uploads/resources/';
        
        // Create upload directories if they don't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
        if (!file_exists($this->uploadDir . 'documents/')) {
            mkdir($this->uploadDir . 'documents/', 0755, true);
        }
        if (!file_exists($this->uploadDir . 'videos/')) {
            mkdir($this->uploadDir . 'videos/', 0755, true);
        }
    }

    private function getCurrentUser() {
        $headers = \getallheaders();
        error_log("All headers: " . json_encode($headers));
        
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        error_log("Token extracted: " . substr($token, 0, 20) . "...");

        $decoded = $this->jwtHelper->validateToken($token);
        if (!$decoded) {
            error_log("Token validation failed");
            return null;
        }
        
        error_log("Token decoded, user_id: " . ($decoded->user_id ?? 'none'));

        $userModel = new User();
        $user = $userModel->findById($decoded->user_id);
        
        if ($user) {
            error_log("User found: " . $user['email'] . " (role: " . $user['role'] . ")");
        } else {
            error_log("User not found in database");
        }
        
        return $user;
    }

    private function requireAuth($allowedRoles = []) {
        $user = $this->getCurrentUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized - Invalid or missing token']);
            exit;
        }

        if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden - Insufficient permissions']);
            exit;
        }

        // Block pending teachers from accessing protected endpoints
        if ($user['role'] === 'teacher' && ($user['account_status'] ?? 'active') === 'pending') {
            http_response_code(403);
            echo json_encode(['error' => 'Your account is pending admin approval']);
            exit;
        }

        return $user;
    }

    // Get resources uploaded by the teacher of a specific course (for students)
    public function getCourseTeacherResources($courseId) {
        $database = new Database();
        $conn = $database->getConnection();

        try {
            // Find approved teachers for this course
            $stmt = $conn->prepare("
                SELECT er.*, u.name as uploader_name
                FROM educational_resources er
                JOIN teacher_course_assignments tca ON tca.teacher_id = er.uploaded_by AND tca.status = 'approved'
                JOIN users u ON u.id = er.uploaded_by
                WHERE tca.course_id = ? AND er.status = 'approved'
                ORDER BY er.created_at DESC
            ");
            $stmt->execute([$courseId]);
            $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($resources as &$r) {
                $r['tags'] = json_decode($r['tags'] ?? '[]', true);
                // Build accessible URL for files
                if (!empty($r['file_path'])) {
                    $r['file_url'] = ($_ENV['APP_URL'] ?? 'http://localhost:8000') . '/uploads/resources/' . $r['file_path'];
                }
            }
            echo json_encode($resources);
        } catch (\Exception $e) {
            echo json_encode([]);
        }
    }

    // Browse approved resources (public)
    public function browse() {
        $filters = [
            'status' => 'approved',
            'resource_type' => $_GET['resource_type'] ?? null,
            'category' => $_GET['category'] ?? null,
            'search' => $_GET['search'] ?? null,
            'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : 50,
            'offset' => isset($_GET['offset']) ? (int)$_GET['offset'] : 0
        ];

        $filters = array_filter($filters, function($value) {
            return $value !== null;
        });

        $resources = $this->resourceModel->getAll($filters);

        foreach ($resources as &$resource) {
            $resource['tags'] = json_decode($resource['tags'] ?? '[]', true);
        }

        echo json_encode($resources);
    }

    // View single resource
    public function view($id) {
        $resource = $this->resourceModel->getById($id);

        if (!$resource || $resource['status'] !== 'approved') {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            return;
        }

        // Increment views
        $this->resourceModel->incrementViews($id);

        $resource['tags'] = json_decode($resource['tags'] ?? '[]', true);

        echo json_encode($resource);
    }

    // Download resource (increment counter)
    public function download($id) {
        $resource = $this->resourceModel->getById($id);

        if (!$resource || $resource['status'] !== 'approved') {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            return;
        }

        // Increment downloads
        $this->resourceModel->incrementDownloads($id);

        echo json_encode([
            'message' => 'Download tracked',
            'file_path' => $resource['file_path'],
            'external_url' => $resource['external_url']
        ]);
    }

    // Teacher: Get my resources
    public function getMyResources() {
        $user = $this->requireAuth(['teacher', 'admin']);
        
        $resources = $this->resourceModel->getByUploader($user['id']);
        
        foreach ($resources as &$resource) {
            $resource['tags'] = json_decode($resource['tags'] ?? '[]', true);
        }

        echo json_encode($resources);
    }

    // Teacher: Create resource with file upload
    public function create() {
        // Debug logging
        error_log("=== CREATE RESOURCE CALLED ===");
        error_log("Headers: " . json_encode(\getallheaders()));
        error_log("POST data: " . json_encode($_POST));
        error_log("FILES: " . json_encode(array_keys($_FILES)));
        
        $user = $this->requireAuth(['teacher', 'admin']);

        $data = [
            'title' => $_POST['title'] ?? '',
            'description' => $_POST['description'] ?? '',
            'resource_type' => $_POST['resource_type'] ?? 'document',
            'category' => $_POST['category'] ?? '',
            'tags' => json_encode(explode(',', $_POST['tags'] ?? '')),
            'uploaded_by' => $user['id'],
            'status' => 'pending',
            'external_url' => $_POST['external_url'] ?? null,
            'file_path' => null,
            'file_size' => 0,
            'file_type' => null
        ];

        // Auto-approve if teacher has an approved course assignment
        if ($user['role'] === 'teacher') {
            $database = new Database();
            $conn = $database->getConnection();
            try {
                $stmt = $conn->prepare("SELECT id FROM teacher_course_assignments WHERE teacher_id = ? AND status = 'approved' LIMIT 1");
                $stmt->execute([$user['id']]);
                if ($stmt->fetch()) {
                    $data['status'] = 'approved'; // auto-approve for assigned teachers
                }
            } catch (\Exception $e) {}
        }

        // Validate required fields
        if (empty($data['title']) || empty($data['category'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and category are required']);
            return;
        }

        // Handle file upload
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->handleFileUpload($_FILES['file']);
            
            if ($uploadResult['success']) {
                $data['file_path'] = $uploadResult['path'];
                $data['file_size'] = $uploadResult['size'];
                $data['file_type'] = $uploadResult['type'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => $uploadResult['error']]);
                return;
            }
        } elseif (empty($data['external_url'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Either file upload or external URL is required']);
            return;
        }

        $resourceId = $this->resourceModel->create($data);

        if ($resourceId) {
            $resource = $this->resourceModel->getById($resourceId);
            $resource['tags'] = json_decode($resource['tags'] ?? '[]', true);
            
            http_response_code(201);
            echo json_encode([
                'message' => 'Resource created successfully',
                'resource' => $resource
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create resource']);
        }
    }

    // Teacher: Update resource
    public function update($id) {
        $user = $this->requireAuth(['teacher', 'admin']);

        $resource = $this->resourceModel->getById($id);
        
        if (!$resource) {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            return;
        }

        // Check ownership
        if ($resource['uploaded_by'] != $user['id'] && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'You can only update your own resources']);
            return;
        }

        $data = [];
        
        if (isset($_POST['title'])) $data['title'] = $_POST['title'];
        if (isset($_POST['description'])) $data['description'] = $_POST['description'];
        if (isset($_POST['resource_type'])) $data['resource_type'] = $_POST['resource_type'];
        if (isset($_POST['category'])) $data['category'] = $_POST['category'];
        if (isset($_POST['tags'])) $data['tags'] = json_encode(explode(',', $_POST['tags']));
        if (isset($_POST['external_url'])) $data['external_url'] = $_POST['external_url'];

        // Handle new file upload
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            // Delete old file if exists
            if ($resource['file_path'] && file_exists($this->uploadDir . $resource['file_path'])) {
                unlink($this->uploadDir . $resource['file_path']);
            }

            $uploadResult = $this->handleFileUpload($_FILES['file']);
            
            if ($uploadResult['success']) {
                $data['file_path'] = $uploadResult['path'];
                $data['file_size'] = $uploadResult['size'];
                $data['file_type'] = $uploadResult['type'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => $uploadResult['error']]);
                return;
            }
        }

        // Reset status to pending if content changed
        if (isset($data['title']) || isset($data['description']) || isset($data['file_path'])) {
            $data['status'] = 'pending';
        }

        if ($this->resourceModel->update($id, $data)) {
            $updatedResource = $this->resourceModel->getById($id);
            $updatedResource['tags'] = json_decode($updatedResource['tags'] ?? '[]', true);
            
            echo json_encode([
                'message' => 'Resource updated successfully',
                'resource' => $updatedResource
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update resource']);
        }
    }

    // Teacher: Delete resource
    public function delete($id) {
        $user = $this->requireAuth(['teacher', 'admin']);

        $resource = $this->resourceModel->getById($id);
        
        if (!$resource) {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            return;
        }

        // Check ownership
        if ($resource['uploaded_by'] != $user['id'] && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'You can only delete your own resources']);
            return;
        }

        // Delete file if exists
        if ($resource['file_path'] && file_exists($this->uploadDir . $resource['file_path'])) {
            unlink($this->uploadDir . $resource['file_path']);
        }

        if ($this->resourceModel->delete($id)) {
            echo json_encode(['message' => 'Resource deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete resource']);
        }
    }

    // Teacher: Get resource statistics
    public function getStats() {
        $user = $this->requireAuth(['teacher', 'admin']);

        $resources = $this->resourceModel->getByUploader($user['id']);
        
        $stats = [
            'total' => count($resources),
            'approved' => 0,
            'pending' => 0,
            'rejected' => 0,
            'total_views' => 0,
            'total_downloads' => 0
        ];

        foreach ($resources as $resource) {
            $stats[$resource['status']]++;
            $stats['total_views'] += $resource['views'];
            $stats['total_downloads'] += $resource['downloads'];
        }

        echo json_encode($stats);
    }

    public function getMatchedRoadmaps($resourceId) {
        // Get roadmaps that this resource is matched to
        try {
            $stmt = $this->db->prepare("
                SELECT
                    cr.id,
                    cr.title,
                    cr.category,
                    cr.difficulty_level,
                    cr.estimated_duration,
                    rr.auto_matched,
                    rr.match_score,
                    rr.phase_index,
                    rr.topic_index
                FROM roadmap_resources rr
                JOIN curated_roadmaps cr ON rr.roadmap_id = cr.id
                WHERE rr.resource_id = ? AND cr.status = 'published'
                ORDER BY rr.match_score DESC, cr.title
            ");

            $stmt->execute([$resourceId]);
            $roadmaps = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'roadmaps' => $roadmaps,
                'count' => count($roadmaps)
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch matched roadmaps']);
        }
    }

    public function triggerAutoMatch($resourceId) {
        // Manually trigger auto-matching for a resource
        $this->requireAuth(['admin', 'teacher']);

        try {
            // Call the stored procedure
            $stmt = $this->db->prepare("CALL auto_match_resources(?)");
            $stmt->execute([$resourceId]);

            // Get the matches
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as match_count
                FROM roadmap_resources
                WHERE resource_id = ? AND auto_matched = TRUE
            ");
            $stmt->execute([$resourceId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Auto-matching completed',
                'matches_found' => $result['match_count']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to trigger auto-match: ' . $e->getMessage()]);
        }
    }


    // Private: Handle file upload
    private function handleFileUpload($file) {
        $allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        $maxSize = 50 * 1024 * 1024; // 50MB

        // Validate file type
        if (!in_array($file['type'], $allowedTypes)) {
            return ['success' => false, 'error' => 'Invalid file type'];
        }

        // Validate file size
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'error' => 'File size exceeds 50MB limit'];
        }

        // Determine subdirectory
        $subdir = strpos($file['type'], 'video') !== false ? 'videos/' : 'documents/';
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $relativePath = $subdir . $filename;
        $fullPath = $this->uploadDir . $relativePath;

        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            return [
                'success' => true,
                'path' => $relativePath,
                'size' => $file['size'],
                'type' => $file['type']
            ];
        } else {
            return ['success' => false, 'error' => 'Failed to move uploaded file'];
        }
    }
}
