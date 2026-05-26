<?php

require_once __DIR__ . '/../Helpers/JWTHelper.php';

class CareersController {
    private $db;
    private $jwtHelper;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->jwtHelper = new JWTHelper();
        $this->ensureTable();
    }

    // ── Auto-create table if it doesn't exist ────────────────────────────────

    private function ensureTable() {
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS careers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    category VARCHAR(100) NOT NULL DEFAULT 'General',
                    required_skills JSON DEFAULT NULL,
                    status ENUM('draft','published') NOT NULL DEFAULT 'published',
                    created_by INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        } catch (\Exception $e) {
            // Table already exists — safe to ignore
        }
    }

    // ── Auth helpers ──────────────────────────────────────────────────────────

    private function requireBit() {
        $user = $this->jwtHelper->getUserFromToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        if ($user['role'] !== 'bit') {
            http_response_code(403);
            echo json_encode(['error' => 'BiT access required']);
            exit();
        }
        return $user;
    }

    // ── BiT Admin: list all careers (draft + published) ───────────────────────

    public function index() {
        $this->requireBit();

        try {
            $search   = $_GET['search']   ?? '';
            $category = $_GET['category'] ?? '';
            $status   = $_GET['status']   ?? '';

            $where  = [];
            $params = [];

            if ($search) {
                $where[]  = '(c.title LIKE ? OR c.description LIKE ?)';
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            if ($category && $category !== 'all') {
                $where[]  = 'c.category = ?';
                $params[] = $category;
            }
            if ($status && $status !== 'all') {
                $where[]  = 'c.status = ?';
                $params[] = $status;
            }

            $sql = "SELECT c.*, u.name AS creator_name
                    FROM careers c
                    LEFT JOIN users u ON c.created_by = u.id"
                 . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
                 . " ORDER BY c.created_at DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as &$r) {
                $r['required_skills'] = json_decode($r['required_skills'] ?? '[]', true) ?? [];
            }

            echo json_encode($rows);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch careers: ' . $e->getMessage()]);
        }
    }

    // ── BiT Admin: get single career ──────────────────────────────────────────

    public function show($id) {
        $this->requireBit();

        try {
            $stmt = $this->db->prepare(
                "SELECT c.*, u.name AS creator_name
                 FROM careers c LEFT JOIN users u ON c.created_by = u.id
                 WHERE c.id = ?"
            );
            $stmt->execute([$id]);
            $career = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$career) {
                http_response_code(404);
                echo json_encode(['error' => 'Career not found']);
                return;
            }

            $career['required_skills'] = json_decode($career['required_skills'] ?? '[]', true) ?? [];
            echo json_encode($career);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // ── BiT Admin: create career ──────────────────────────────────────────────

    public function create() {
        $user = $this->requireBit();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['title']) || empty($data['description'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and description are required']);
                return;
            }

            $skills = [];
            if (!empty($data['required_skills']) && is_array($data['required_skills'])) {
                $skills = array_values(array_filter(array_map('trim', $data['required_skills'])));
            }

            $stmt = $this->db->prepare("
                INSERT INTO careers (title, description, category, thumbnail_url, required_skills, status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                trim($data['title']),
                trim($data['description']),
                trim($data['category'] ?? 'General'),
                !empty($data['thumbnail_url']) ? trim($data['thumbnail_url']) : null,
                json_encode($skills),
                in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'published',
                $user['id'],
            ]);

            $id = $this->db->lastInsertId();
            http_response_code(201);
            echo json_encode(['message' => 'Career created', 'id' => (int)$id]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create career: ' . $e->getMessage()]);
        }
    }

    // ── BiT Admin: update career ──────────────────────────────────────────────

    public function update($id) {
        $this->requireBit();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $this->db->prepare("SELECT id FROM careers WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Career not found']);
                return;
            }

            $fields = [];
            $params = [];

            if (isset($data['title']))       { $fields[] = 'title = ?';       $params[] = trim($data['title']); }
            if (isset($data['description'])) { $fields[] = 'description = ?'; $params[] = trim($data['description']); }
            if (isset($data['category']))    { $fields[] = 'category = ?';    $params[] = trim($data['category']); }

            if (array_key_exists('thumbnail_url', $data)) {
                $fields[] = 'thumbnail_url = ?';
                $params[] = !empty($data['thumbnail_url']) ? trim($data['thumbnail_url']) : null;
            }

            if (isset($data['required_skills']) && is_array($data['required_skills'])) {
                $fields[] = 'required_skills = ?';
                $params[] = json_encode(array_values(array_filter(array_map('trim', $data['required_skills']))));
            }

            if (isset($data['status']) && in_array($data['status'], ['draft', 'published'])) {
                $fields[] = 'status = ?';
                $params[] = $data['status'];
            }

            if (empty($fields)) {
                echo json_encode(['message' => 'Nothing to update']);
                return;
            }

            $params[] = $id;
            $this->db->prepare("UPDATE careers SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
            echo json_encode(['message' => 'Career updated']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update career: ' . $e->getMessage()]);
        }
    }

    // ── BiT Admin: delete career ──────────────────────────────────────────────

    public function delete($id) {
        $this->requireBit();

        try {
            $stmt = $this->db->prepare("SELECT id FROM careers WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Career not found']);
                return;
            }

            $this->db->prepare("DELETE FROM careers WHERE id = ?")->execute([$id]);
            echo json_encode(['message' => 'Career deleted']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // ── BiT Admin: publish / unpublish ────────────────────────────────────────

    public function publish($id) {
        $this->requireBit();
        $this->setStatus($id, 'published');
    }

    public function unpublish($id) {
        $this->requireBit();
        $this->setStatus($id, 'draft');
    }

    private function setStatus($id, $status) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM careers WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Career not found']);
                return;
            }
            $this->db->prepare("UPDATE careers SET status = ? WHERE id = ?")->execute([$status, $id]);
            echo json_encode(['message' => "Career $status"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // ── Public (students): list published careers only ────────────────────────

    public function publicIndex() {
        try {
            $search   = $_GET['search']   ?? '';
            $category = $_GET['category'] ?? '';

            $where  = ['status = ?'];
            $params = ['published'];

            if (!empty($search)) {
                $where[]  = '(title LIKE ? OR description LIKE ?)';
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            if (!empty($category) && $category !== 'all') {
                $where[]  = 'category = ?';
                $params[] = $category;
            }

            $sql = "SELECT id, title, description, category, required_skills, created_at
                    FROM careers
                    WHERE " . implode(' AND ', $where) . "
                    ORDER BY created_at DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as &$r) {
                $r['required_skills'] = json_decode($r['required_skills'] ?? '[]', true) ?? [];
            }

            echo json_encode($rows);
        } catch (\Exception $e) {
            // Return error details so frontend can show them
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load careers: ' . $e->getMessage()]);
        }
    }

    // ── Public: get single published career ───────────────────────────────────

    public function publicShow($id) {
        try {
            $stmt = $this->db->prepare(
                "SELECT id, title, description, category, thumbnail_url, required_skills, created_at
                 FROM careers WHERE id = ? AND status = 'published'"
            );
            $stmt->execute([$id]);
            $career = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$career) {
                http_response_code(404);
                echo json_encode(['error' => 'Career not found']);
                return;
            }

            $career['required_skills'] = json_decode($career['required_skills'] ?? '[]', true) ?? [];
            echo json_encode($career);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // ── Public: distinct categories of published careers ─────────────────────

    public function publicCategories() {
        try {
            $stmt = $this->db->query(
                "SELECT DISTINCT category FROM careers WHERE status = 'published' ORDER BY category"
            );
            $cats = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo json_encode($cats);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
