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

    public function getStats() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $stats = $this->userModel->getStats($user['id']);
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
