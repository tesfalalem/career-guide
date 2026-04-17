<?php

namespace App\Controllers;

use PDO;

class NotificationController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    // Helper to get authenticated user ID
    private function getAuthenticatedUserId() {
        require_once __DIR__ . '/../Helpers/JWTHelper.php';
        $jwtHelper = new \JWTHelper();
        $user = $jwtHelper->getUserFromToken();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        
        return $user['id'];
    }
    
    // Get all notifications for a user
    public function getNotifications() {
        $userId = $this->getAuthenticatedUserId();
        $limit = $_GET['limit'] ?? 50;
        $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
        
        try {
            $sql = "SELECT * FROM notifications WHERE user_id = :user_id";
            
            if ($unreadOnly) {
                $sql .= " AND is_read = FALSE";
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'notifications' => $notifications
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to fetch notifications: ' . $e->getMessage()
            ]);
        }
    }
    
    // Get unread count
    public function getUnreadCount() {
        $userId = $this->getAuthenticatedUserId();
        
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM notifications 
                WHERE user_id = :user_id AND is_read = FALSE
            ");
            $stmt->execute(['user_id' => $userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'count' => (int)$result['count']
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get unread count: ' . $e->getMessage()
            ]);
        }
    }
    
    // Mark notification as read
    public function markAsRead($notificationId) {
        $userId = $this->getAuthenticatedUserId();
        
        try {
            $stmt = $this->db->prepare("
                UPDATE notifications 
                SET is_read = TRUE, read_at = NOW() 
                WHERE id = :id AND user_id = :user_id
            ");
            $stmt->execute([
                'id' => $notificationId,
                'user_id' => $userId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to mark as read: ' . $e->getMessage()
            ]);
        }
    }
    
    // Mark all as read
    public function markAllAsRead() {
        $userId = $this->getAuthenticatedUserId();
        
        try {
            $stmt = $this->db->prepare("
                UPDATE notifications 
                SET is_read = TRUE, read_at = NOW() 
                WHERE user_id = :user_id AND is_read = FALSE
            ");
            $stmt->execute(['user_id' => $userId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to mark all as read: ' . $e->getMessage()
            ]);
        }
    }
    
    // Delete notification
    public function deleteNotification($notificationId) {
        $userId = $this->getAuthenticatedUserId();
        
        try {
            $stmt = $this->db->prepare("
                DELETE FROM notifications 
                WHERE id = :id AND user_id = :user_id
            ");
            $stmt->execute([
                'id' => $notificationId,
                'user_id' => $userId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification deleted'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to delete notification: ' . $e->getMessage()
            ]);
        }
    }
    
    // Create notification (helper method for other controllers)
    public function createNotification($userId, $type, $title, $message, $link = null) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO notifications (user_id, type, title, message, link)
                VALUES (:user_id, :type, :title, :message, :link)
            ");
            $stmt->execute([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link
            ]);
            
            return [
                'success' => true,
                'notification_id' => $this->db->lastInsertId()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to create notification: ' . $e->getMessage()
            ];
        }
    }
    
    // Get notification preferences
    public function getPreferences() {
        $userId = $this->getAuthenticatedUserId();
        
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM notification_preferences 
                WHERE user_id = :user_id
            ");
            $stmt->execute(['user_id' => $userId]);
            $preferences = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Create default preferences if not exist
            if (!$preferences) {
                $stmt = $this->db->prepare("
                    INSERT INTO notification_preferences (user_id) 
                    VALUES (:user_id)
                ");
                $stmt->execute(['user_id' => $userId]);
                
                // Fetch again
                $stmt = $this->db->prepare("
                    SELECT * FROM notification_preferences 
                    WHERE user_id = :user_id
                ");
                $stmt->execute(['user_id' => $userId]);
                $preferences = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            echo json_encode([
                'success' => true,
                'preferences' => $preferences
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get preferences: ' . $e->getMessage()
            ]);
        }
    }
    
    // Update notification preferences
    public function updatePreferences() {
        $userId = $this->getAuthenticatedUserId();
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $allowedFields = [
                'email_notifications',
                'push_notifications',
                'resource_updates',
                'feedback_notifications',
                'system_notifications',
                'student_activity',
                'admin_announcements'
            ];
            
            $updates = [];
            $params = ['user_id' => $userId];
            
            foreach ($input as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $updates[] = "$key = :$key";
                    $params[$key] = $value ? 1 : 0;
                }
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No valid preferences to update'
                ]);
                return;
            }
            
            $sql = "UPDATE notification_preferences SET " . implode(', ', $updates) . " WHERE user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Preferences updated successfully'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update preferences: ' . $e->getMessage()
            ]);
        }
    }
}
