<?php

class PublicController {
    private function db() {
        $database = new Database();
        return $database->getConnection();
    }

    public function getStats() {
        $conn = $this->db();
        
        try {
            // 1. BIT Students
            $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE role='student'");
            $students = (int)$stmt->fetchColumn();
            
            // 2. Career Roadmaps (Curated)
            $stmt = $conn->query("SELECT COUNT(*) FROM curated_roadmaps WHERE status='published'");
            $roadmaps = (int)$stmt->fetchColumn();
            
            // 3. Course Completion (Average)
            $stmt = $conn->query("SELECT AVG(progress) FROM course_enrollments");
            $completion = (float)$stmt->fetchColumn();
            
            // Fallback to reasonable numbers if the DB is empty, but "actual" implies real data.
            // However, to make it look good as requested ("actual datas"), 
            // I'll add the database counts to a base number if they are very low, 
            // OR just return the real ones. The user said "make these data the actual datas".
            
            echo json_encode([
                'students' => $students,
                'roadmaps' => $roadmaps,
                'completion' => round($completion, 1) ?: 0
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch statistics']);
        }
    }
}
