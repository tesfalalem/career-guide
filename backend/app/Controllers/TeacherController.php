<?php

namespace App\Controllers;

use PDO;
use PDOException;

require_once __DIR__ . '/../Helpers/JWTHelper.php';

class TeacherController {
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

        // Block pending teachers from accessing teacher endpoints
        if ($user['role'] === 'teacher' && ($user['account_status'] ?? 'active') === 'pending') {
            http_response_code(403);
            echo json_encode(['error' => 'Your account is pending admin approval']);
            exit;
        }

        return $user;
    }

    // Get teacher dashboard statistics
    public function getStats() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            // Resource stats
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_resources,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_resources,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_resources,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_resources
                FROM educational_resources
                WHERE uploaded_by = ?
            ");
            $stmt->execute([$teacher['id']]);
            $resourceStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Student stats
            $stmt = $this->db->prepare("
                SELECT COUNT(DISTINCT user_id) as active_students
                FROM student_engagement_metrics
                WHERE teacher_id = ?
            ");
            $stmt->execute([$teacher['id']]);
            $studentStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Engagement stats
            $stmt = $this->db->prepare("
                SELECT 
                    AVG(engagement_score) as avg_engagement,
                    SUM(total_time_spent) as total_time_spent
                FROM student_engagement_metrics
                WHERE teacher_id = ?
            ");
            $stmt->execute([$teacher['id']]);
            $engagementStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Rating stats
            $stmt = $this->db->prepare("
                SELECT 
                    AVG(rating) as avg_rating,
                    COUNT(rating) as total_ratings
                FROM student_resource_progress srp
                JOIN educational_resources er ON srp.resource_id = er.id
                WHERE er.uploaded_by = ? AND srp.rating IS NOT NULL
            ");
            $stmt->execute([$teacher['id']]);
            $ratingStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Unread feedback count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as unread_feedback
                FROM feedback_messages
                WHERE to_user_id = ? AND is_read = FALSE
            ");
            $stmt->execute([$teacher['id']]);
            $feedbackStats = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'stats' => [
                    'totalResources' => (int)$resourceStats['total_resources'],
                    'approvedResources' => (int)$resourceStats['approved_resources'],
                    'pendingResources' => (int)$resourceStats['pending_resources'],
                    'rejectedResources' => (int)$resourceStats['rejected_resources'],
                    'activeStudents' => (int)$studentStats['active_students'],
                    'avgEngagement' => round((float)$engagementStats['avg_engagement'], 1),
                    'totalTimeSpent' => (int)$engagementStats['total_time_spent'],
                    'avgRating' => round((float)$ratingStats['avg_rating'], 1),
                    'totalRatings' => (int)$ratingStats['total_ratings'],
                    'unreadFeedback' => (int)$feedbackStats['unread_feedback']
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch statistics: ' . $e->getMessage()]);
        }
    }

    // Get recent activity feed
    public function getActivity() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $activities = [];

            // Recent resource approvals/rejections
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    title,
                    status,
                    updated_at,
                    'resource' as type
                FROM educational_resources
                WHERE uploaded_by = ?
                ORDER BY updated_at DESC
                LIMIT 10
            ");
            $stmt->execute([$teacher['id']]);
            $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($resources as $resource) {
                $activities[] = [
                    'id' => $resource['id'],
                    'type' => 'resource',
                    'title' => $resource['title'],
                    'status' => $resource['status'],
                    'date' => $resource['updated_at']
                ];
            }

            // Recent feedback
            $stmt = $this->db->prepare("
                SELECT 
                    fm.id,
                    fm.message,
                    fm.created_at,
                    u.name as student_name,
                    'feedback' as type
                FROM feedback_messages fm
                JOIN users u ON fm.from_user_id = u.id
                WHERE fm.to_user_id = ?
                ORDER BY fm.created_at DESC
                LIMIT 10
            ");
            $stmt->execute([$teacher['id']]);
            $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($feedback as $fb) {
                $activities[] = [
                    'id' => $fb['id'],
                    'type' => 'feedback',
                    'title' => 'New feedback from ' . $fb['student_name'],
                    'details' => $fb['message'],
                    'date' => $fb['created_at']
                ];
            }

            // Sort by date
            usort($activities, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });

            echo json_encode([
                'success' => true,
                'activities' => array_slice($activities, 0, 15)
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch activity: ' . $e->getMessage()]);
        }
    }

    // Get at-risk students
    public function getAtRiskStudents() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $stmt = $this->db->prepare("
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    sem.engagement_score,
                    sem.risk_level,
                    sem.last_activity_at
                FROM student_engagement_metrics sem
                JOIN users u ON sem.user_id = u.id
                WHERE sem.teacher_id = ? AND sem.risk_level IN ('medium', 'high')
                ORDER BY 
                    CASE sem.risk_level 
                        WHEN 'high' THEN 1 
                        WHEN 'medium' THEN 2 
                        ELSE 3 
                    END,
                    sem.engagement_score ASC
                LIMIT 10
            ");
            $stmt->execute([$teacher['id']]);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'students' => $students
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch at-risk students: ' . $e->getMessage()]);
        }
    }

    // Get teacher profile
    public function getProfile() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $stmt = $this->db->prepare("
                SELECT 
                    id, name, email, 
                    bio, teaching_philosophy, years_experience,
                    qualifications, certifications, expertise_areas,
                    languages, profile_photo, institution
                FROM users
                WHERE id = ?
            ");
            $stmt->execute([$teacher['id']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$profile) {
                http_response_code(404);
                echo json_encode(['error' => 'Profile not found']);
                return;
            }

            // Parse JSON fields safely
            $profile['qualifications'] = json_decode($profile['qualifications'] ?? '[]', true) ?: [];
            $profile['certifications'] = json_decode($profile['certifications'] ?? '[]', true) ?: [];
            $profile['expertise_areas'] = json_decode($profile['expertise_areas'] ?? '[]', true) ?: [];
            $profile['languages'] = json_decode($profile['languages'] ?? '[]', true) ?: [];
            
            // Add default values for fields that don't exist in DB yet
            $profile['phone_number'] = '';
            $profile['linkedin_url'] = '';
            $profile['website_url'] = '';

            echo json_encode([
                'success' => true,
                'profile' => $profile
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch profile: ' . $e->getMessage()]);
        }
    }

    // Update teacher profile
    public function updateProfile() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $this->db->prepare("
                UPDATE users SET
                    name = ?,
                    phone_number = ?,
                    institution = ?,
                    bio = ?,
                    teaching_philosophy = ?,
                    years_experience = ?,
                    qualifications = ?,
                    certifications = ?,
                    expertise_areas = ?,
                    languages = ?,
                    linkedin_url = ?,
                    website_url = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $data['name'] ?? $teacher['name'],
                $data['phone'] ?? $teacher['phone_number'],
                $data['institution'] ?? $teacher['institution'],
                $data['bio'] ?? $teacher['bio'],
                $data['teachingPhilosophy'] ?? $teacher['teaching_philosophy'],
                $data['yearsExperience'] ?? $teacher['years_experience'],
                json_encode($data['qualifications'] ?? []),
                json_encode($data['certifications'] ?? []),
                json_encode($data['expertiseAreas'] ?? []),
                json_encode($data['languages'] ?? []),
                $data['linkedin'] ?? $teacher['linkedin_url'],
                $data['website'] ?? $teacher['website_url'],
                $teacher['id']
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    // Get teacher settings
    public function getSettings() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $stmt = $this->db->prepare("
                SELECT * FROM teacher_settings WHERE user_id = ?
            ");
            $stmt->execute([$teacher['id']]);
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$settings) {
                // Create default settings
                $stmt = $this->db->prepare("
                    INSERT INTO teacher_settings (user_id) VALUES (?)
                ");
                $stmt->execute([$teacher['id']]);
                
                $stmt = $this->db->prepare("
                    SELECT * FROM teacher_settings WHERE user_id = ?
                ");
                $stmt->execute([$teacher['id']]);
                $settings = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            echo json_encode([
                'success' => true,
                'settings' => $settings
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch settings: ' . $e->getMessage()]);
        }
    }

    // Update teacher settings
    public function updateSettings() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $this->db->prepare("
                UPDATE teacher_settings SET
                    email_notifications = ?,
                    push_notifications = ?,
                    resource_approval_alerts = ?,
                    student_feedback_alerts = ?,
                    weekly_report = ?,
                    privacy_show_email = ?,
                    privacy_show_phone = ?,
                    privacy_public_profile = ?
                WHERE user_id = ?
            ");

            $stmt->execute([
                $data['emailNotifications'] ?? true,
                $data['pushNotifications'] ?? true,
                $data['resourceApprovalAlerts'] ?? true,
                $data['studentFeedbackAlerts'] ?? true,
                $data['weeklyReport'] ?? true,
                $data['privacyShowEmail'] ?? false,
                $data['privacyShowPhone'] ?? false,
                $data['privacyPublicProfile'] ?? true,
                $teacher['id']
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update settings: ' . $e->getMessage()]);
        }
    }
}
