<?php

require_once __DIR__ . '/../Models/Roadmap.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';
require_once __DIR__ . '/../Services/AiService.php';

class RoadmapController {
    private $roadmapModel;
    private $jwtHelper;
    private $aiService;

    public function __construct() {
        $this->roadmapModel = new Roadmap();
        $this->jwtHelper = new JWTHelper();
        $this->aiService = new AiService();
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

        // Generate roadmap using Gemini AI
        $roadmapData = $this->aiService->generateRoadmap($role);

        if (!$roadmapData) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate roadmap']);
            return;
        }

        echo json_encode($roadmapData);
    }

    public function save() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $roadmapId = $this->roadmapModel->create([
            'title' => $data['title'],
            'role' => $data['role'],
            'road_data' => json_encode($data),
            'user_id' => $user['id']
        ]);

        if ($roadmapId) {
            $roadmap = $this->roadmapModel->findById($roadmapId);
            echo json_encode($roadmap);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save roadmap']);
        }
    }

    public function userRoadmaps() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $roadmaps = $this->roadmapModel->getUserRoadmaps($user['id']);
        echo json_encode($roadmaps);
    }

    public function delete($id) {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $result = $this->roadmapModel->delete($id, $user['id']);

        if ($result) {
            echo json_encode(['message' => 'Roadmap deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete roadmap']);
        }
    }
}
