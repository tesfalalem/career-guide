<?php

class User {
    private $conn;
    private $table = 'users';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($data) {
        // Build dynamic query based on provided data
        $columns = ['name', 'email', 'password', 'role', 'xp', 'streak', 'created_at'];
        $values = [':name', ':email', ':password', ':role', '0', '0', 'NOW()'];
        
        // Add optional columns if they exist in data
        $optionalColumns = [
            'role_request', 'account_status', 'requested_at',
            'academic_year', 'student_id', 'department', 'graduation_year',
            'institution', 'years_experience', 'expertise_areas', 'qualifications', 'bio',
            'role_preference', 'profile_completed'
        ];
        
        foreach ($optionalColumns as $col) {
            if (isset($data[$col])) {
                $columns[] = $col;
                $values[] = ":$col";
            }
        }
        
        $columnsStr = implode(', ', $columns);
        $valuesStr = implode(', ', $values);
        
        $query = "INSERT INTO " . $this->table . " ($columnsStr) VALUES ($valuesStr)";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind required parameters
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $data['password']);
        $stmt->bindParam(':role', $data['role']);
        
        // Bind optional parameters
        foreach ($optionalColumns as $col) {
            if (isset($data[$col])) {
                $stmt->bindParam(":$col", $data[$col]);
            }
        }

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

        return $stmt->fetch();
    }

    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        return $stmt->fetch();
    }

    public function update($id, $data) {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }
        $fieldsString = implode(', ', $fields);

        $query = "UPDATE " . $this->table . " SET $fieldsString WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        foreach ($data as $key => $value) {
            $stmt->bindParam(":$key", $data[$key]);
        }

        return $stmt->execute();
    }

    public function getStats($userId) {
        $query = "SELECT 
                    (SELECT COUNT(*) FROM course_enrollments WHERE user_id = :user_id) as courses_enrolled,
                    (SELECT xp FROM users WHERE id = :user_id) as total_xp,
                    (SELECT streak FROM users WHERE id = :user_id) as streak,
                    0 as completed_lessons
                  FROM users WHERE id = :user_id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        return $stmt->fetch();
    }

    public function getRecentActivity($userId) {
        $query = "SELECT 
                    'enrollment' as type,
                    c.title,
                    c.category,
                    ce.enrolled_at as date
                  FROM course_enrollments ce
                  JOIN courses c ON ce.course_id = c.id
                  WHERE ce.user_id = :user_id
                  ORDER BY ce.enrolled_at DESC
                  LIMIT 5";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
