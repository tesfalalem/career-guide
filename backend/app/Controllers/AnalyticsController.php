<?php

namespace App\Controllers;

use PDO;
use PDOException;

require_once __DIR__ . '/../Helpers/JWTHelper.php';

class AnalyticsController {
    private $db;
    private $jwtHelper;

    public function __construct($db) {
        $this->db = $db;
        $this->jwtHelper = new \JWTHelper();
    }

    private function getCurrentUser() {
        // Polyfill for getallheaders() in CLI mode
        if (!function_exists('getallheaders')) {
            $headers = [];
            foreach ($_SERVER as $name => $value) {
                if (substr($name, 0, 5) == 'HTTP_') {
                    $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
                }
            }
        } else {
            $headers = \getallheaders();
        }
        
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

        return $user;
    }

    // Get teacher analytics overview
    public function getTeacherAnalytics() {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            // Resource statistics
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_resources,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_resources,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_resources,
                    SUM(views) as total_views,
                    SUM(downloads) as total_downloads
                FROM educational_resources
                WHERE uploaded_by = ?
            ");
            $stmt->execute([$teacher['id']]);
            $resourceStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Student statistics
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT user_id) as total_students,
                    AVG(engagement_score) as avg_engagement,
                    SUM(total_time_spent) as total_time_spent,
                    AVG(average_rating) as avg_rating
                FROM student_engagement_metrics
                WHERE teacher_id = ?
            ");
            $stmt->execute([$teacher['id']]);
            $studentStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Top resources
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    title,
                    resource_type,
                    category,
                    views,
                    downloads,
                    (SELECT AVG(rating) FROM student_resource_progress WHERE resource_id = er.id AND rating IS NOT NULL) as avg_rating,
                    (SELECT COUNT(*) FROM student_resource_progress WHERE resource_id = er.id) as student_count
                FROM educational_resources er
                WHERE uploaded_by = ? AND status = 'approved'
                ORDER BY views DESC
                LIMIT 10
            ");
            $stmt->execute([$teacher['id']]);
            $topResources = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Rating distribution
            $stmt = $this->db->prepare("
                SELECT 
                    rating,
                    COUNT(*) as count
                FROM student_resource_progress srp
                JOIN educational_resources er ON srp.resource_id = er.id
                WHERE er.uploaded_by = ? AND srp.rating IS NOT NULL
                GROUP BY rating
                ORDER BY rating DESC
            ");
            $stmt->execute([$teacher['id']]);
            $ratingDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Monthly activity (last 6 months)
            $stmt = $this->db->prepare("
                SELECT 
                    DATE_FORMAT(accessed_at, '%Y-%m') as month,
                    COUNT(DISTINCT user_id) as active_students,
                    COUNT(*) as total_accesses,
                    SUM(time_spent) as total_time
                FROM resource_access_logs ral
                JOIN educational_resources er ON ral.resource_id = er.id
                WHERE er.uploaded_by = ?
                AND accessed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(accessed_at, '%Y-%m')
                ORDER BY month DESC
            ");
            $stmt->execute([$teacher['id']]);
            $monthlyActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Category performance
            $stmt = $this->db->prepare("
                SELECT 
                    er.category,
                    COUNT(DISTINCT er.id) as resource_count,
                    COUNT(DISTINCT srp.user_id) as student_count,
                    AVG(srp.rating) as avg_rating,
                    SUM(er.views) as total_views
                FROM educational_resources er
                LEFT JOIN student_resource_progress srp ON er.id = srp.resource_id
                WHERE er.uploaded_by = ? AND er.status = 'approved'
                GROUP BY er.category
                ORDER BY total_views DESC
            ");
            $stmt->execute([$teacher['id']]);
            $categoryPerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'resource_stats' => $resourceStats,
                'student_stats' => $studentStats,
                'top_resources' => $topResources,
                'rating_distribution' => $ratingDistribution,
                'monthly_activity' => $monthlyActivity,
                'category_performance' => $categoryPerformance
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch analytics: ' . $e->getMessage()]);
        }
    }

    // Get resource-specific analytics
    public function getResourceAnalytics($resourceId) {
        $teacher = $this->requireAuth(['teacher', 'admin']);

        try {
            // Verify ownership
            $stmt = $this->db->prepare("SELECT * FROM educational_resources WHERE id = ? AND uploaded_by = ?");
            $stmt->execute([$resourceId, $teacher['id']]);
            $resource = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$resource) {
                http_response_code(404);
                echo json_encode(['error' => 'Resource not found']);
                return;
            }

            // Student progress on this resource
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_students,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    AVG(progress_percentage) as avg_progress,
                    AVG(time_spent_total) as avg_time_spent,
                    AVG(rating) as avg_rating
                FROM student_resource_progress
                WHERE resource_id = ?
            ");
            $stmt->execute([$resourceId]);
            $progressStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // Daily access pattern (last 30 days)
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(accessed_at) as date,
                    COUNT(DISTINCT user_id) as unique_students,
                    COUNT(*) as total_accesses,
                    SUM(time_spent) as total_time
                FROM resource_access_logs
                WHERE resource_id = ?
                AND accessed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(accessed_at)
                ORDER BY date DESC
            ");
            $stmt->execute([$resourceId]);
            $dailyAccess = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Student list with progress
            $stmt = $this->db->prepare("
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    srp.status,
                    srp.progress_percentage,
                    srp.time_spent_total,
                    srp.rating,
                    srp.last_accessed_at
                FROM student_resource_progress srp
                JOIN users u ON srp.user_id = u.id
                WHERE srp.resource_id = ?
                ORDER BY srp.last_accessed_at DESC
            ");
            $stmt->execute([$resourceId]);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'resource' => $resource,
                'progress_stats' => $progressStats,
                'daily_access' => $dailyAccess,
                'students' => $students
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch resource analytics']);
        }
    }
}
