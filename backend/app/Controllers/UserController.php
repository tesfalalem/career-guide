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
            echo json_encode(['error' => 'Invalid file type. Allowed: jpg, jpeg, png, webp']);
            return;
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'Image too large (max 5MB)']);
            return;
        }

        $uploadDir = __DIR__ . '/../../uploads/profiles/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Delete old profile image file if it exists
        $existing = $this->userModel->findById($user['id']);
        if (!empty($existing['profile_image'])) {
            $oldFilename = $this->extractFilenameFromUrl($existing['profile_image']);
            if ($oldFilename) {
                $oldPath = $uploadDir . $oldFilename;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }
        }

        $filename = 'profile_' . $user['id'] . '_' . time() . '.' . $ext;
        $dest = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save image to disk']);
            return;
        }

        // Build public URL using query param format (matches UploadController::serve)
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        $url = $scheme . '://' . $host . '/api/uploads/serve?file=' . urlencode($filename) . '&type=profile';

        $updated = $this->userModel->update($user['id'], ['profile_image' => $url]);

        if ($updated) {
            echo json_encode(['message' => 'Profile image updated', 'url' => $url]);
        } else {
            // File was saved but DB update failed — return the URL anyway so frontend can use it
            http_response_code(500);
            echo json_encode(['error' => 'Image saved but failed to update database. Ensure profile_image column exists (run /run-profile-image-migration.php)']);
        }
    }

    public function deleteProfileImage() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $profile = $this->userModel->findById($user['id']);
        if (!empty($profile['profile_image'])) {
            $uploadDir = __DIR__ . '/../../uploads/profiles/';
            $filename = $this->extractFilenameFromUrl($profile['profile_image']);
            if ($filename) {
                $filePath = $uploadDir . $filename;
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }

        $this->userModel->update($user['id'], ['profile_image' => null]);
        echo json_encode(['message' => 'Profile image removed']);
    }

    /**
     * Extract the filename from a profile image URL.
     * URL format: http://host/api/uploads/serve?file=profile_X_Y.jpg&type=profile
     */
    private function extractFilenameFromUrl($url) {
        if (empty($url)) return null;
        $parsed = parse_url($url);
        if (!empty($parsed['query'])) {
            parse_str($parsed['query'], $params);
            return isset($params['file']) ? basename($params['file']) : null;
        }
        // Fallback: try path-based URL
        return basename($parsed['path'] ?? '');
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
