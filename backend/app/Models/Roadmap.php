<?php

class Roadmap {
    private $conn;
    private $table = 'roadmaps';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (title, role, road_data, user_id, created_at) 
                  VALUES (:title, :role, :road_data, :user_id, NOW())";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':road_data', $data['road_data']);
        $stmt->bindParam(':user_id', $data['user_id']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function findById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $roadmap = $stmt->fetch();
        if ($roadmap && isset($roadmap['road_data'])) {
            $roadmap['road_data'] = json_decode($roadmap['road_data'], true);
        }

        return $roadmap;
    }

    public function getUserRoadmaps($userId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        $roadmaps = $stmt->fetchAll();
        foreach ($roadmaps as &$roadmap) {
            if (isset($roadmap['road_data'])) {
                $roadmap['road_data'] = json_decode($roadmap['road_data'], true);
            }
        }

        return $roadmaps;
    }

    public function delete($id, $userId) {
        $query = "DELETE FROM " . $this->table . " 
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $userId);

        return $stmt->execute();
    }
}
