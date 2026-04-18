<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class AssessmentController {
    private $jwtHelper;

    public function __construct() {
        $this->jwtHelper = new JWTHelper();
    }

    private function getUser() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $decoded = $this->jwtHelper->validateToken($token);
        if (!$decoded) return null;
        $userModel = new User();
        return $userModel->findById($decoded->user_id);
    }

    // Create assessment with questions for a course (bit/admin/teacher)
    public function create() {
        $user = $this->getUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        // Allow students, teachers, admins, and bit users
        // (In a stricter system, we'd check if student is enrolled, but let's stick to the requirement)
        if (!in_array($user['role'], ['student', 'teacher', 'admin', 'bit'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['course_id']) || empty($data['title']) || empty($data['questions'])) {
            http_response_code(400);
            echo json_encode(['error' => 'course_id, title and questions are required']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();

        // Auto-create tables if migration hasn't been run
        $this->ensureTables($conn);

        // Create assessment
        $stmt = $conn->prepare("
            INSERT INTO assessments (course_id, title, description, time_limit, created_by)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['course_id'],
            $data['title'],
            $data['description'] ?? '',
            $data['time_limit'] ?? 30,
            $user['id']
        ]);
        $assessmentId = $conn->lastInsertId();

        // Insert questions
        foreach ($data['questions'] as $i => $q) {
            $conn->prepare("
                INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, explanation, order_index)
                VALUES (?, ?, ?, ?, ?, ?)
            ")->execute([
                $assessmentId,
                $q['question'],
                json_encode($q['options']),
                (int)$q['correct_answer'],
                $q['explanation'] ?? '',
                $i
            ]);
        }

        http_response_code(201);
        echo json_encode(['message' => 'Assessment created', 'assessment_id' => $assessmentId]);
    }

    // Get questions with correct answers (for admin/bit editing)
    public function getQuestionsAdmin($id) {
        $user = $this->getUser();
        if (!$user || !in_array($user['role'], ['bit', 'admin', 'teacher'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();
        $this->ensureTables($conn);

        $stmt = $conn->prepare("SELECT id, question, options, correct_answer, explanation, order_index FROM assessment_questions WHERE assessment_id = ? ORDER BY order_index ASC");
        $stmt->execute([$id]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($questions as &$q) { $q['options'] = json_decode($q['options'], true); }
        echo json_encode($questions);
    }

    // Get all assessments for courses the student is enrolled in
    public function getForStudent() {
        $user = $this->getUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();

        // Auto-create tables if migration hasn't been run
        $this->ensureTables($conn);

        // Show assessments for courses the student is enrolled in directly
        // OR courses linked to roadmaps the student is enrolled in
        $stmt = $conn->prepare("
            SELECT DISTINCT a.id, a.title, a.description, a.time_limit, a.course_id,
                   c.title as course_title, c.level,
                   (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id) as question_count,
                   (SELECT COUNT(*) FROM assessment_attempts att
                    WHERE att.assessment_id = a.id AND att.user_id = ?) as attempt_count,
                   (SELECT att.score FROM assessment_attempts att
                    WHERE att.assessment_id = a.id AND att.user_id = ?
                    ORDER BY att.completed_at DESC LIMIT 1) as last_score
            FROM assessments a
            JOIN courses c ON a.course_id = c.id
            WHERE (
                -- Direct course enrollment
                EXISTS (
                    SELECT 1 FROM course_enrollments ce
                    WHERE ce.course_id = c.id AND ce.user_id = ?
                )
                OR
                -- Enrolled via roadmap
                EXISTS (
                    SELECT 1 FROM roadmap_courses rc
                    JOIN roadmap_enrollments re ON re.roadmap_id = rc.roadmap_id
                    WHERE rc.course_id = c.id AND re.user_id = ?
                )
            )
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([$user['id'], $user['id'], $user['id'], $user['id']]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function ensureTables($conn) {
        $conn->exec("
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                time_limit INT DEFAULT 30,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        $conn->exec("
            CREATE TABLE IF NOT EXISTS assessment_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assessment_id INT NOT NULL,
                question TEXT NOT NULL,
                options JSON NOT NULL,
                correct_answer INT NOT NULL,
                explanation TEXT,
                order_index INT DEFAULT 0,
                FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        $conn->exec("
            CREATE TABLE IF NOT EXISTS assessment_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assessment_id INT NOT NULL,
                user_id INT NOT NULL,
                score INT DEFAULT 0,
                total_questions INT DEFAULT 0,
                answers JSON,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    }

    // Get a single assessment with questions (for taking the quiz)
    public function getById($id) {
        $user = $this->getUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();

        $stmt = $conn->prepare("SELECT * FROM assessments WHERE id = ?");
        $stmt->execute([$id]);
        $assessment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$assessment) {
            http_response_code(404);
            echo json_encode(['error' => 'Assessment not found']);
            return;
        }

        $qStmt = $conn->prepare("
            SELECT id, question, options, order_index FROM assessment_questions
            WHERE assessment_id = ? ORDER BY order_index ASC
        ");
        $qStmt->execute([$id]);
        $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($questions as &$q) {
            $q['options'] = json_decode($q['options'], true);
            // Don't send correct_answer to student
        }

        $assessment['questions'] = $questions;
        echo json_encode($assessment);
    }

    // Submit quiz answers
    public function submit($id) {
        $user = $this->getUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $answers = $data['answers'] ?? [];

        $db = new Database();
        $conn = $db->getConnection();

        // Get correct answers
        $stmt = $conn->prepare("
            SELECT id, correct_answer, explanation FROM assessment_questions
            WHERE assessment_id = ?
        ");
        $stmt->execute([$id]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $score = 0;
        $results = [];
        foreach ($questions as $q) {
            $selected = $answers[(string)$q['id']] ?? -1;
            $correct = (int)$q['correct_answer'] === (int)$selected;
            if ($correct) $score++;
            $results[] = [
                'question_id'    => $q['id'],
                'selected'       => $selected,
                'correct_answer' => (int)$q['correct_answer'],
                'is_correct'     => $correct,
                'explanation'    => $q['explanation']
            ];
        }

        $total = count($questions);
        $percentage = $total > 0 ? round(($score / $total) * 100) : 0;

        // Save attempt
        $conn->prepare("
            INSERT INTO assessment_attempts (assessment_id, user_id, score, total_questions, answers)
            VALUES (?, ?, ?, ?, ?)
        ")->execute([$id, $user['id'], $score, $total, json_encode($answers)]);

        // Award XP
        // Award XP and Update Course Progress
        if ($percentage >= 70) {
            $conn->prepare("UPDATE users SET xp = xp + ? WHERE id = ?")
                 ->execute([$score * 10, $user['id']]);

            // Mark course as 100% complete if assessment passed
            $stmt = $conn->prepare("SELECT course_id FROM assessments WHERE id = ?");
            $stmt->execute([$id]);
            $assessment = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($assessment) {
                $conn->prepare("UPDATE course_enrollments SET progress = 100 WHERE course_id = ? AND user_id = ?")
                     ->execute([$assessment['course_id'], $user['id']]);
            }
        }

        echo json_encode([
            'score'      => $score,
            'total'      => $total,
            'percentage' => $percentage,
            'passed'     => $percentage >= 70,
            'results'    => $results
        ]);
    }

    // Get assessments for a course (bit/admin view)
    public function getByCourse($courseId) {
        $user = $this->getUser();
        if (!$user || !in_array($user['role'], ['bit', 'admin', 'teacher'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();
        $this->ensureTables($conn);

        $stmt = $conn->prepare("
            SELECT a.*, COUNT(aq.id) as question_count,
                   COUNT(DISTINCT att.user_id) as attempt_count
            FROM assessments a
            LEFT JOIN assessment_questions aq ON aq.assessment_id = a.id
            LEFT JOIN assessment_attempts att ON att.assessment_id = a.id
            WHERE a.course_id = ?
            GROUP BY a.id
        ");
        $stmt->execute([$courseId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // Delete assessment
    public function delete($id) {
        $user = $this->getUser();
        if (!$user || !in_array($user['role'], ['bit', 'admin', 'teacher'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();
        $conn->prepare("DELETE FROM assessments WHERE id = ?")->execute([$id]);
        echo json_encode(['message' => 'Assessment deleted']);
    }
}
