<?php

namespace App\Controllers;

use PDO;
use PDOException;

require_once __DIR__ . '/../Helpers/JWTHelper.php';

class StudentMonitoringController {
    private $db;
    private $jwtHelper;

    public function __construct($db) {
        $this->db = $db;
        $this->jwtHelper = new \JWTHelper();
    }

    private function getCurrentUser() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $decoded = $this->jwtHelper->validateToken($token);
        
        if (!$decoded) {
            return null;
        }

        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$decoded->user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function requireAuth($allowedRoles = []) {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }

        if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
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

    // Get all students using teacher's resources
    public function getMyStudents() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $stmt = $this->db->prepare("
                SELECT * FROM teacher_student_overview
                WHERE teacher_id = ?
                ORDER BY engagement_score DESC, last_activity_at DESC
            ");
            
            $stmt->execute([$teacher['id']]);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'students' => $students,
                'total' => count($students),
                'summary' => [
                    'total_students' => count($students),
                    'high_risk' => count(array_filter($students, fn($s) => $s['risk_level'] === 'high')),
                    'medium_risk' => count(array_filter($students, fn($s) => $s['risk_level'] === 'medium')),
                    'low_risk' => count(array_filter($students, fn($s) => $s['risk_level'] === 'low')),
                    'avg_engagement' => count($students) > 0 ? array_sum(array_column($students, 'engagement_score')) / count($students) : 0
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch students']);
        }
    }

    // Get detailed progress for a specific student
    public function getStudentProgress($studentId) {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            // Get student info
            $stmt = $this->db->prepare("SELECT id, name, email FROM users WHERE id = ?");
            $stmt->execute([$studentId]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$student) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                return;
            }

            // Get progress on teacher's resources
            $stmt = $this->db->prepare("
                SELECT 
                    srp.*,
                    er.title as resource_title,
                    er.resource_type,
                    er.category
                FROM student_resource_progress srp
                JOIN educational_resources er ON srp.resource_id = er.id
                WHERE srp.user_id = ? AND er.uploaded_by = ?
                ORDER BY srp.last_accessed_at DESC
            ");
            
            $stmt->execute([$studentId, $teacher['id']]);
            $progress = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get engagement metrics
            $stmt = $this->db->prepare("
                SELECT * FROM student_engagement_metrics
                WHERE user_id = ? AND teacher_id = ?
            ");
            
            $stmt->execute([$studentId, $teacher['id']]);
            $metrics = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get recent activity
            $stmt = $this->db->prepare("
                SELECT 
                    ral.*,
                    er.title as resource_title
                FROM resource_access_logs ral
                JOIN educational_resources er ON ral.resource_id = er.id
                WHERE ral.user_id = ? AND er.uploaded_by = ?
                ORDER BY ral.accessed_at DESC
                LIMIT 20
            ");
            
            $stmt->execute([$studentId, $teacher['id']]);
            $activity = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'student' => $student,
                'progress' => $progress,
                'metrics' => $metrics,
                'recent_activity' => $activity
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch student progress']);
        }
    }

    // Send feedback to student
    public function sendFeedback() {
        $teacher = $this->requireAuth(['teacher', 'admin']);
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['to_user_id']) || !isset($data['subject']) || !isset($data['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO feedback_messages (
                    from_user_id, to_user_id, resource_id, roadmap_id,
                    feedback_type, subject, message, parent_feedback_id
                ) VALUES (?, ?, ?, ?, 'teacher_to_student', ?, ?, ?)
            ");

            $stmt->execute([
                $teacher['id'],
                $data['to_user_id'],
                $data['resource_id'] ?? null,
                $data['roadmap_id'] ?? null,
                $data['subject'],
                $data['message'],
                $data['parent_feedback_id'] ?? null
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Feedback sent successfully',
                'feedback_id' => $this->db->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send feedback']);
        }
    }

    // Get feedback history with a student
    public function getFeedbackHistory($studentId) {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $stmt = $this->db->prepare("
                SELECT 
                    fm.*,
                    u_from.name as from_name,
                    u_to.name as to_name,
                    er.title as resource_title,
                    cr.title as roadmap_title
                FROM feedback_messages fm
                JOIN users u_from ON fm.from_user_id = u_from.id
                JOIN users u_to ON fm.to_user_id = u_to.id
                LEFT JOIN educational_resources er ON fm.resource_id = er.id
                LEFT JOIN curated_roadmaps cr ON fm.roadmap_id = cr.id
                WHERE (fm.from_user_id = ? AND fm.to_user_id = ?)
                   OR (fm.from_user_id = ? AND fm.to_user_id = ?)
                ORDER BY fm.created_at DESC
            ");

            $stmt->execute([$teacher['id'], $studentId, $studentId, $teacher['id']]);
            $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Mark as read
            $stmt = $this->db->prepare("
                UPDATE feedback_messages 
                SET is_read = TRUE, read_at = NOW()
                WHERE to_user_id = ? AND from_user_id = ? AND is_read = FALSE
            ");
            $stmt->execute([$teacher['id'], $studentId]);

            echo json_encode([
                'success' => true,
                'feedback' => $feedback,
                'total' => count($feedback)
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch feedback history']);
        }
    }

    // Get unread feedback count
    public function getUnreadCount() {
        $user = $this->requireAuth();

        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM feedback_messages
                WHERE to_user_id = ? AND is_read = FALSE
            ");

            $stmt->execute([$user['id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'unread_count' => $result['count']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch unread count']);
        }
    }

    // Track resource access (for students)
    public function trackAccess() {
        $user = $this->requireAuth(['student']);
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['resource_id']) || !isset($data['access_type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        try {
            // Log access
            $stmt = $this->db->prepare("
                INSERT INTO resource_access_logs (
                    user_id, resource_id, access_type, time_spent, progress_percentage
                ) VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $user['id'],
                $data['resource_id'],
                $data['access_type'],
                $data['time_spent'] ?? 0,
                $data['progress_percentage'] ?? 0
            ]);

            // Update or create progress record
            $stmt = $this->db->prepare("
                INSERT INTO student_resource_progress (
                    user_id, resource_id, status, progress_percentage, 
                    time_spent_total, last_accessed_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    progress_percentage = VALUES(progress_percentage),
                    time_spent_total = time_spent_total + VALUES(time_spent_total),
                    last_accessed_at = NOW(),
                    completed_at = CASE WHEN VALUES(status) = 'completed' THEN NOW() ELSE completed_at END
            ");

            $status = $data['progress_percentage'] >= 100 ? 'completed' : 
                     ($data['progress_percentage'] > 0 ? 'in_progress' : 'not_started');

            $stmt->execute([
                $user['id'],
                $data['resource_id'],
                $status,
                $data['progress_percentage'] ?? 0,
                $data['time_spent'] ?? 0
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Access tracked successfully'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to track access']);
        }
    }

    // Update resource rating (for students)
    public function rateResource() {
        $user = $this->requireAuth(['student']);
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['resource_id']) || !isset($data['rating'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        if ($data['rating'] < 1 || $data['rating'] > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE student_resource_progress
                SET rating = ?
                WHERE user_id = ? AND resource_id = ?
            ");

            $stmt->execute([$data['rating'], $user['id'], $data['resource_id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Rating submitted successfully'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit rating']);
        }
    }
}
