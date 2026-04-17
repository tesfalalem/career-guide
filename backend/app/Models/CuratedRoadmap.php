<?php

class CuratedRoadmap {
    private $conn;
    private $table = 'curated_roadmaps';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (title, description, category, difficulty_level, estimated_duration, 
                   created_by, status, tags, phases, thumbnail_url) 
                  VALUES (:title, :description, :category, :difficulty_level, :estimated_duration,
                          :created_by, :status, :tags, :phases, :thumbnail_url)";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':difficulty_level', $data['difficulty_level']);
        $stmt->bindParam(':estimated_duration', $data['estimated_duration']);
        $stmt->bindParam(':created_by', $data['created_by']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':tags', $data['tags']);
        $stmt->bindParam(':phases', $data['phases']);
        $stmt->bindParam(':thumbnail_url', $data['thumbnail_url']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function getAll($filters = []) {
        $query = "SELECT r.*, u.name as creator_name 
                  FROM " . $this->table . " r
                  LEFT JOIN users u ON r.created_by = u.id
                  WHERE 1=1";

        // Apply filters
        if (isset($filters['status'])) {
            $query .= " AND r.status = :status";
        }
        if (isset($filters['category'])) {
            $query .= " AND r.category = :category";
        }
        if (isset($filters['difficulty_level'])) {
            $query .= " AND r.difficulty_level = :difficulty_level";
        }
        if (isset($filters['search'])) {
            $query .= " AND (r.title LIKE :search OR r.description LIKE :search)";
        }

        $query .= " ORDER BY r.created_at DESC";

        if (isset($filters['limit'])) {
            $query .= " LIMIT :limit";
            if (isset($filters['offset'])) {
                $query .= " OFFSET :offset";
            }
        }

        $stmt = $this->conn->prepare($query);

        // Bind filter parameters
        if (isset($filters['status'])) {
            $stmt->bindParam(':status', $filters['status']);
        }
        if (isset($filters['category'])) {
            $stmt->bindParam(':category', $filters['category']);
        }
        if (isset($filters['difficulty_level'])) {
            $stmt->bindParam(':difficulty_level', $filters['difficulty_level']);
        }
        if (isset($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $stmt->bindParam(':search', $searchTerm);
        }
        if (isset($filters['limit'])) {
            $stmt->bindParam(':limit', $filters['limit'], PDO::PARAM_INT);
            if (isset($filters['offset'])) {
                $stmt->bindParam(':offset', $filters['offset'], PDO::PARAM_INT);
            }
        }

        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $query = "SELECT r.*, u.name as creator_name, u.email as creator_email
                  FROM " . $this->table . " r
                  LEFT JOIN users u ON r.created_by = u.id
                  WHERE r.id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch();
    }

    public function update($id, $data) {
        $fields = [];
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $fields[] = "$key = :$key";
            }
        }
        $fieldsString = implode(', ', $fields);

        $query = "UPDATE " . $this->table . " SET $fieldsString WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $stmt->bindParam(":$key", $data[$key]);
            }
        }

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function incrementViews($id) {
        $query = "UPDATE " . $this->table . " SET views = views + 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function incrementEnrollments($id) {
        $query = "UPDATE " . $this->table . " SET enrollments = enrollments + 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getPopular($limit = 10) {
        $query = "SELECT r.*, u.name as creator_name 
                  FROM " . $this->table . " r
                  LEFT JOIN users u ON r.created_by = u.id
                  WHERE r.status = 'published'
                  ORDER BY r.enrollments DESC, r.views DESC
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getByCreator($creatorId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE created_by = :creator_id 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':creator_id', $creatorId);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getCategories() {
        $query = "SELECT DISTINCT category, COUNT(*) as count 
                  FROM " . $this->table . " 
                  WHERE status = 'published' AND category IS NOT NULL
                  GROUP BY category
                  ORDER BY count DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
