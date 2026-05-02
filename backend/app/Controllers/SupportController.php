<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/SupportMessage.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class SupportController {
    private $messageModel;
    private $userModel;
    private $jwtHelper;

    public function __construct() {
        $this->messageModel = new SupportMessage();
        $this->userModel = new User();
        $this->jwtHelper = new JWTHelper();
    }

    private function getAuthenticatedUser() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? $headers['authorization'] ?? '');
        
        if (!$token) return null;
        
        $decoded = $this->jwtHelper->validateToken($token);
        if (!$decoded) return null;
        
        return $this->userModel->findById($decoded->user_id);
    }

    public function getMessages() {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        // Default admin to chat with is ID 1
        $adminId = 1; 
        
        $messages = $this->messageModel->getConversation($user['id'], $adminId);
        
        // Mark all admin messages to this student as read
        $this->messageModel->markAsRead($user['id'], false);
        
        echo json_encode($messages);
    }

    public function sendMessage() {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Message is required']);
            return;
        }

        $receiverId = $data['receiver_id'] ?? 1;
        $guestId = null;

        // If receiverId is not numeric, it's likely a guest_id UUID
        if (!is_numeric($receiverId)) {
            $guestId = $receiverId;
            $receiverId = null;
        }
        
        $success = $this->messageModel->create($user['id'], $receiverId, $data['message'], $guestId);
        
        if ($success) {
            echo json_encode(['message' => 'Message sent successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message']);
        }
    }

    public function getAdminConversations() {
        $user = $this->getAuthenticatedUser();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $conversations = $this->messageModel->getAdminConversations();
        echo json_encode($conversations);
    }

    public function getAdminMessages($identifier) {
        $user = $this->getAuthenticatedUser();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        // Identifier could be userId or guestId
        if (is_numeric($identifier)) {
            $messages = $this->messageModel->getConversation($identifier, $user['id']);
            $this->messageModel->markAsRead($identifier, true);
        } else {
            $messages = $this->messageModel->getConversation(null, null, $identifier);
            // Mark guest messages as read - might need a separate markAsReadForGuest
            // $this->messageModel->markAsReadForGuest($identifier);
        }
        
        echo json_encode($messages);
    }

    public function getGuestMessages($guestId) {
        $messages = $this->messageModel->getConversation(null, null, $guestId);
        echo json_encode($messages);
    }

    public function sendGuestMessage() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['message']) || !isset($data['guest_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Message and guest_id are required']);
            return;
        }

        $receiverId = 1; // Default admin
        $success = $this->messageModel->create(null, $receiverId, $data['message'], $data['guest_id']);
        
        if ($success) {
            echo json_encode(['message' => 'Message sent successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message']);
        }
    }

    public function deleteMessage($id) {
        $user = $this->getAuthenticatedUser();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $success = $this->messageModel->delete($id);
        if ($success) {
            echo json_encode(['message' => 'Message deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete message']);
        }
    }
}
