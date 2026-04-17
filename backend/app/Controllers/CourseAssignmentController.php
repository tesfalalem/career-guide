<?php
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class CourseAssignmentController {
    private $jwtHelper;

    public function __construct() {
        $this->jwtHelper = new JWTHelper();
    }

    private function getUser() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $decoded = $this->jwtHelper->validateToken($token);
        if (!$decoded) return null;
        $m = new User(); return $m->findById($decoded->user_id);
    }

    private function db() { $d = new Database(); return $d->getConnection(); }

    private function ensureTables($conn) {
        $conn->exec("CREATE TABLE IF NOT EXISTS teacher_course_assignments (id INT AUTO_INCREMENT PRIMARY KEY,teacher_id INT NOT NULL,course_id INT NOT NULL,status ENUM('pending','approved','rejected') DEFAULT 'pending',notes TEXT,requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,approved_at TIMESTAMP NULL,approved_by INT NULL,UNIQUE KEY ua(teacher_id,course_id),FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $conn->exec("CREATE TABLE IF NOT EXISTS student_class_enrollments (id INT AUTO_INCREMENT PRIMARY KEY,student_id INT NOT NULL,course_id INT NOT NULL,teacher_id INT NOT NULL,enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY usk(student_id,course_id),FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        try { $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS course_selected TINYINT(1) DEFAULT 0"); } catch(\Exception $e) {}
    }

    // ── TEACHER: Request assignment to a course ────────────────────────────────
    public function requestAssignment() {
        $user = $this->getUser();
        if (!$user || $user['role'] !== 'teacher') { http_response_code(403); echo json_encode(['error'=>'Teacher access required']); return; }
        $data = json_decode(file_get_contents("php://input"), true);
        $courseId = $data['course_id'] ?? null;
        if (!$courseId) { http_response_code(400); echo json_encode(['error'=>'course_id required']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        // Check course exists and is from BiT
        $stmt = $conn->prepare("SELECT id,title FROM courses WHERE id=?"); $stmt->execute([$courseId]); $course = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$course) { http_response_code(404); echo json_encode(['error'=>'Course not found']); return; }
        // Insert or update request
        $stmt = $conn->prepare("INSERT INTO teacher_course_assignments (teacher_id,course_id,status,requested_at) VALUES (?,?,'pending',NOW()) ON DUPLICATE KEY UPDATE status='pending',requested_at=NOW()");
        $stmt->execute([$user['id'], $courseId]);
        // Mark teacher as having selected a course
        $conn->prepare("UPDATE users SET course_selected=1 WHERE id=?")->execute([$user['id']]);
        // Notify admins
        $admins = $conn->query("SELECT id FROM users WHERE role='admin'")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($admins as $a) {
            $conn->prepare("INSERT INTO notifications (user_id,type,title,message,link) VALUES (?,'course_request',?,?,'/admin/approvals')")->execute([$a['id'],'Teacher Course Request','"'.$user['name'].'" requested assignment to "'.$course['title'].'"']);
        }
        echo json_encode(['message'=>'Assignment request submitted','status'=>'pending']);
    }

    // ── TEACHER: Get my assignment status ──────────────────────────────────────
    public function getMyAssignment() {
        $user = $this->getUser();
        if (!$user || $user['role'] !== 'teacher') { http_response_code(403); echo json_encode(['error'=>'Teacher access required']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->prepare("SELECT tca.*,c.title as course_title,c.description as course_description,c.level,c.category,c.modules FROM teacher_course_assignments tca JOIN courses c ON tca.course_id=c.id WHERE tca.teacher_id=? ORDER BY tca.requested_at DESC LIMIT 1");
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && is_string($row['modules'])) $row['modules'] = json_decode($row['modules'], true);
        echo json_encode($row ?: null);
    }

    // ── ADMIN: Get all pending teacher assignment requests ─────────────────────
    public function getPendingAssignments() {
        $user = $this->getUser();
        if (!$user || $user['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Admin access required']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->query("SELECT tca.*,u.name as teacher_name,u.email as teacher_email,u.institution,c.title as course_title,c.category FROM teacher_course_assignments tca JOIN users u ON tca.teacher_id=u.id JOIN courses c ON tca.course_id=c.id WHERE tca.status='pending' ORDER BY tca.requested_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── ADMIN: Approve teacher assignment ──────────────────────────────────────
    public function approveAssignment($id) {
        $admin = $this->getUser();
        if (!$admin || $admin['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Admin access required']); return; }
        $data = json_decode(file_get_contents("php://input"), true);
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->prepare("SELECT tca.*,u.name as teacher_name,c.title as course_title FROM teacher_course_assignments tca JOIN users u ON tca.teacher_id=u.id JOIN courses c ON tca.course_id=c.id WHERE tca.id=?");
        $stmt->execute([$id]); $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { http_response_code(404); echo json_encode(['error'=>'Assignment not found']); return; }
        $conn->prepare("UPDATE teacher_course_assignments SET status='approved',approved_at=NOW(),approved_by=?,notes=? WHERE id=?")->execute([$admin['id'],$data['notes']??'',$id]);
        // Also enroll teacher in the course
        $conn->prepare("INSERT IGNORE INTO course_enrollments (user_id,course_id,enrolled_at) VALUES (?,?,NOW())")->execute([$row['teacher_id'],$row['course_id']]);
        // Notify teacher
        $conn->prepare("INSERT INTO notifications (user_id,type,title,message,link) VALUES (?,'assignment_approved',?,?,'/teacher/courses')")->execute([$row['teacher_id'],'Course Assignment Approved','You have been approved to teach "'.$row['course_title'].'". You can now upload materials.']);
        echo json_encode(['success'=>true,'message'=>'Assignment approved']);
    }

    // ── ADMIN: Reject teacher assignment ──────────────────────────────────────
    public function rejectAssignment($id) {
        $admin = $this->getUser();
        if (!$admin || $admin['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Admin access required']); return; }
        $data = json_decode(file_get_contents("php://input"), true);
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->prepare("SELECT tca.*,u.name as teacher_name,c.title as course_title FROM teacher_course_assignments tca JOIN users u ON tca.teacher_id=u.id JOIN courses c ON tca.course_id=c.id WHERE tca.id=?");
        $stmt->execute([$id]); $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { http_response_code(404); echo json_encode(['error'=>'Assignment not found']); return; }
        $conn->prepare("UPDATE teacher_course_assignments SET status='rejected',approved_at=NOW(),approved_by=?,notes=? WHERE id=?")->execute([$admin['id'],$data['notes']??'',$id]);
        $conn->prepare("INSERT INTO notifications (user_id,type,title,message,link) VALUES (?,'assignment_rejected',?,?,'/teacher/courses')")->execute([$row['teacher_id'],'Course Assignment Rejected','Your request to teach "'.$row['course_title'].'" was not approved. '.$data['notes']??'']);
        echo json_encode(['success'=>true,'message'=>'Assignment rejected']);
    }

    // ── STUDENT: Enroll in a course under a teacher ────────────────────────────
    public function studentEnroll() {
        $user = $this->getUser();
        if (!$user || $user['role'] !== 'student') { http_response_code(403); echo json_encode(['error'=>'Student access required']); return; }
        $data = json_decode(file_get_contents("php://input"), true);
        $courseId = $data['course_id'] ?? null; $teacherId = $data['teacher_id'] ?? null;
        if (!$courseId) { http_response_code(400); echo json_encode(['error'=>'course_id required']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        // If no teacher specified, pick the first approved teacher for this course
        if (!$teacherId) {
            $stmt = $conn->prepare("SELECT teacher_id FROM teacher_course_assignments WHERE course_id=? AND status='approved' LIMIT 1");
            $stmt->execute([$courseId]); $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $teacherId = $row['teacher_id'] ?? null;
        }
        // Enroll in course_enrollments
        $conn->prepare("INSERT IGNORE INTO course_enrollments (user_id,course_id,enrolled_at) VALUES (?,?,NOW())")->execute([$user['id'],$courseId]);
        // Link to teacher's class if teacher exists
        if ($teacherId) {
            $conn->prepare("INSERT INTO student_class_enrollments (student_id,course_id,teacher_id) VALUES (?,?,?) ON DUPLICATE KEY UPDATE teacher_id=?")->execute([$user['id'],$courseId,$teacherId,$teacherId]);
        }
        echo json_encode(['message'=>'Enrolled successfully','teacher_id'=>$teacherId]);
    }

    // ── STUDENT: Get available courses with teacher info ───────────────────────
    public function getAvailableCourses() {
        $user = $this->getUser();
        if (!$user) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->query("SELECT c.id,c.title,c.description,c.category,c.level,c.duration,c.rating,c.enrolled_count,c.modules,GROUP_CONCAT(DISTINCT u.name ORDER BY u.name SEPARATOR ', ') as teachers FROM courses c LEFT JOIN teacher_course_assignments tca ON tca.course_id=c.id AND tca.status='approved' LEFT JOIN users u ON u.id=tca.teacher_id GROUP BY c.id ORDER BY c.created_at DESC");
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($courses as &$c) {
            if (is_string($c['modules'])) $c['modules'] = json_decode($c['modules'], true);
        }
        echo json_encode($courses);
    }

    // ── TEACHER: Get students in my class ─────────────────────────────────────
    public function getMyStudents() {
        $user = $this->getUser();
        if (!$user || $user['role'] !== 'teacher') { http_response_code(403); echo json_encode(['error'=>'Teacher access required']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->prepare("SELECT u.id,u.name,u.email,u.xp,u.streak,sce.course_id,c.title as course_title,sce.enrolled_at,COALESCE(ce.progress,0) as progress FROM student_class_enrollments sce JOIN users u ON sce.student_id=u.id JOIN courses c ON sce.course_id=c.id LEFT JOIN course_enrollments ce ON ce.user_id=sce.student_id AND ce.course_id=sce.course_id WHERE sce.teacher_id=? ORDER BY sce.enrolled_at DESC");
        $stmt->execute([$user['id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── ADMIN: Get all assignments (any status) ────────────────────────────────
    public function getAllAssignments() {
        $user = $this->getUser();
        if (!$user || $user['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Admin access required']); return; }
        $conn = $this->db(); $this->ensureTables($conn);
        $stmt = $conn->query("SELECT tca.*,u.name as teacher_name,u.email as teacher_email,c.title as course_title FROM teacher_course_assignments tca JOIN users u ON tca.teacher_id=u.id JOIN courses c ON tca.course_id=c.id ORDER BY tca.requested_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
