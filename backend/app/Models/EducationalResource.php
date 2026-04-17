<?php

class EducationalResource {
    private $conn;
    private $table = 'educational_resources';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (title, description, resource_type, file_path, external_url, 
                   category, tags, uploaded_by, file_size, file_type, status) 
                  VALUES (:title, :description, :resource_type, :file_path, :external_url,
                          :category, :tags, :uploaded_by, :file_size, :file_type, :status)";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':resource_type', $data['resource_type']);
        $stmt->bindParam(':file_path', $data['file_path']);
        $stmt->bindParam(':external_url', $data['external_url']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':tags', $data['tags']);
        $stmt->bindParam(':uploaded_by', $data['uploaded_by']);
        $stmt->bindParam(':file_size', $data['file_size']);
        $stmt->bindParam(':file_type', $data['file_type']);
        $stmt->bindParam(':status', $data['status']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function getAll($filters = []) {
        $query = "SELECT r.*, u.name as uploader_name 
                  FROM " . $this->table . " r
                  LEFT JOIN users u ON r.uploaded_by = u.id
                  WHERE 1=1";

        if (isset($filters['status'])) {
            $query .= " AND r.status = :status";
        }
        if (isset($filters['resource_type'])) {
            $query .= " AND r.resource_type = :resource_type";
        }
        if (isset($filters['category'])) {
            $query .= " AND r.category = :category";
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

        if (isset($filters['status'])) {
            $stmt->bindParam(':status', $filters['status']);
        }
        if (isset($filters['resource_type'])) {
            $stmt->bindParam(':resource_type', $filters['resource_type']);
        }
        if (isset($filters['category'])) {
            $stmt->bindParam(':category', $filters['category']);
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
        $query = "SELECT r.*, u.name as uploader_name, u.email as uploader_email
                  FROM " . $this->table . " r
                  LEFT JOIN users u ON r.uploaded_by = u.id
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

    public function incrementDownloads($id) {
        $query = "UPDATE " . $this->table . " SET downloads = downloads + 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function approve($id) {
        $query = "UPDATE " . $this->table . " SET status = 'approved' WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function reject($id) {
        $query = "UPDATE " . $this->table . " SET status = 'rejected' WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getByUploader($uploaderId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE uploaded_by = :uploader_id 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':uploader_id', $uploaderId);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getPending() {
        $query = "SELECT r.*, u.name as uploader_name 
                  FROM " . $this->table . " r
                  LEFT JOIN users u ON r.uploaded_by = u.id
                  WHERE r.status = 'pending'
                  ORDER BY r.created_at ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
