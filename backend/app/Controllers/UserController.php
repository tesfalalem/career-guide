<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class UserController {
    private $userModel;
    private $jwtHelper;

    public function __construct() {
        $this->userModel = new User();
        $this->jwtHelper = new JWTHelper();
    }

    public function getProfile() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $profile = $this->userModel->findById($user['id']);
        unset($profile['password']);
        
        echo json_encode($profile);
    }

    public function updateProfile() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $updateData = [];
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['academic_year'])) $updateData['academic_year'] = $data['academic_year'];

        $result = $this->userModel->update($user['id'], $updateData);

        if ($result) {
            echo json_encode(['message' => 'Profile updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update profile']);
        }
    }

    public function updateProfileImage() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No image uploaded']);
            return;
        }

        $file = $_FILES['image'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type']);
            return;
        }

        $uploadDir = __DIR__ . '/../../uploads/profiles/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = 'profile_' . $user['id'] . '_' . time() . '.' . $ext;
        $dest = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            // Build public URL
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            $url = $scheme . '://' . $host . '/api/uploads/serve?file=' . urlencode($filename) . '&type=profile';
            
            $this->userModel->update($user['id'], ['profile_image' => $url]);
            
            echo json_encode(['message' => 'Image updated', 'url' => $url]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save image']);
        }
    }

    public function getStats() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $rawStats = $this->userModel->getStats($user['id']);
        
        // Map to camelCase for frontend
        $stats = [
            'coursesEnrolled' => (int)($rawStats['courses_enrolled'] ?? 0),
            'totalXP' => (int)($rawStats['total_xp'] ?? 0),
            'streak' => (int)($rawStats['streak'] ?? 0),
            'completedLessons' => (int)($rawStats['completed_lessons'] ?? 0)
        ];
        
        echo json_encode($stats);
    }

    public function getActivity() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $activity = $this->userModel->getRecentActivity($user['id']);
        echo json_encode($activity);
    }
}
