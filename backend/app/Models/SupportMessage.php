<?php

class SupportMessage {
    private $conn;
    private $table = 'support_messages';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($senderId, $receiverId, $message, $guestId = null) {
        $query = "INSERT INTO " . $this->table . " (sender_id, receiver_id, message, guest_id) VALUES (:sender_id, :receiver_id, :message, :guest_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':sender_id', $senderId);
        $stmt->bindParam(':receiver_id', $receiverId);
        $stmt->bindParam(':message', $message);
        $stmt->bindParam(':guest_id', $guestId);

        return $stmt->execute();
    }

    public function getConversation($userId1, $userId2, $guestId = null) {
        if ($guestId) {
            $query = "SELECT sm.*, COALESCE(u.name, 'Guest') as sender_name 
                      FROM " . $this->table . " sm
                      LEFT JOIN users u ON sm.sender_id = u.id
                      WHERE sm.guest_id = :guest_id 
                      ORDER BY sm.created_at ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':guest_id', $guestId);
        } else {
            // Check if one of them is an admin to enable 'Team' chat
            $query = "SELECT role FROM users WHERE id = :u1 OR id = :u2";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':u1', $userId1);
            $stmt->bindParam(':u2', $userId2);
            $stmt->execute();
            $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $hasAdmin = in_array('admin', $roles);

            if ($hasAdmin) {
                // If one party is an admin, get all messages between the non-admin user and ANY admin
                // First identify the non-admin user
                $query = "SELECT id, role FROM users WHERE id IN (:u1, :u2)";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':u1', $userId1);
                $stmt->bindParam(':u2', $userId2);
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $nonAdminId = null;
                foreach ($users as $u) {
                    if ($u['role'] !== 'admin') {
                        $nonAdminId = $u['id'];
                        break;
                    }
                }

                // If both are admins or something weird, fall back to strict pair
                if (!$nonAdminId) {
                    $query = "SELECT sm.*, u.name as sender_name FROM " . $this->table . " sm
                              JOIN users u ON sm.sender_id = u.id
                              WHERE (sm.sender_id = :u1 AND sm.receiver_id = :u2) OR (sm.sender_id = :u2 AND sm.receiver_id = :u1)
                              ORDER BY sm.created_at ASC";
                } else {
                    $query = "SELECT sm.*, u.name as sender_name FROM " . $this->table . " sm
                              JOIN users u ON sm.sender_id = u.id
                              WHERE (sm.sender_id = :non_admin AND sm.receiver_id IN (SELECT id FROM users WHERE role = 'admin'))
                              OR (sm.sender_id IN (SELECT id FROM users WHERE role = 'admin') AND sm.receiver_id = :non_admin)
                              ORDER BY sm.created_at ASC";
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(':non_admin', $nonAdminId);
                    $stmt->execute();
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
            } else {
                $query = "SELECT sm.*, u.name as sender_name FROM " . $this->table . " sm
                          JOIN users u ON sm.sender_id = u.id
                          WHERE (sm.sender_id = :u1 AND sm.receiver_id = :u2) OR (sm.sender_id = :u2 AND sm.receiver_id = :u1)
                          ORDER BY sm.created_at ASC";
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':u1', $userId1);
            $stmt->bindParam(':u2', $userId2);
        }
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAdminConversations() {
        $query = "SELECT DISTINCT 
                    CASE 
                        WHEN u1.role = 'admin' THEN u2.id 
                        ELSE u1.id 
                    END as user_id,
                    CASE 
                        WHEN u1.role = 'admin' THEN u2.name 
                        ELSE u1.name 
                    END as name,
                    CASE 
                        WHEN u1.role = 'admin' THEN u2.email 
                        ELSE u1.email 
                    END as email,
                    guest_id,
                    (SELECT message FROM " . $this->table . " 
                     WHERE (sender_id = u1.id AND receiver_id = u2.id) OR (sender_id = u2.id AND receiver_id = u1.id) OR (guest_id = sm.guest_id AND sm.guest_id IS NOT NULL)
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM " . $this->table . " 
                     WHERE (sender_id = u1.id AND receiver_id = u2.id) OR (sender_id = u2.id AND receiver_id = u1.id) OR (guest_id = sm.guest_id AND sm.guest_id IS NOT NULL)
                     ORDER BY created_at DESC LIMIT 1) as last_activity
                  FROM " . $this->table . " sm
                  LEFT JOIN users u1 ON sm.sender_id = u1.id
                  LEFT JOIN users u2 ON sm.receiver_id = u2.id
                  WHERE u1.role = 'admin' OR u2.role = 'admin' OR sm.guest_id IS NOT NULL
                  HAVING (user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users WHERE role = 'admin')) OR guest_id IS NOT NULL
                  ORDER BY last_activity DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead($userId, $isAdmin = false) {
        if ($isAdmin) {
            // Admin is marking student's messages as read
            $query = "UPDATE " . $this->table . " SET is_read = 1 
                      WHERE sender_id = :user_id AND receiver_id IN (SELECT id FROM users WHERE role = 'admin') AND is_read = 0";
        } else {
            // Student is marking admin messages as read
            $query = "UPDATE " . $this->table . " SET is_read = 1 
                      WHERE sender_id IN (SELECT id FROM users WHERE role = 'admin') AND receiver_id = :user_id AND is_read = 0";
        }
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
