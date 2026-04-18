<?php

class Course {
    private $conn;
    private $table = 'courses';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (title, description, category, level, modules, duration, author, created_by, created_at) 
                  VALUES (:title, :description, :category, :level, :modules, :duration, :author, :created_by, NOW())";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':level', $data['level']);
        $stmt->bindParam(':modules', $data['modules']);
        $stmt->bindParam(':duration', $data['duration']);
        $stmt->bindParam(':author', $data['author']);
        $stmt->bindParam(':created_by', $data['created_by']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function findById($id, $userId = null) {
        if ($userId) {
            $query = "SELECT c.*, ce.progress, ce.completed_lessons, ce.enrolled_at 
                      FROM " . $this->table . " c
                      LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = :user_id
                      WHERE c.id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':user_id', $userId);
        } else {
            $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
        }

        $stmt->execute();
        $course = $stmt->fetch();
        
        if ($course && isset($course['modules'])) {
            $course['modules'] = is_string($course['modules']) ? json_decode($course['modules'], true) : $course['modules'];
        }

        if ($course && isset($course['completed_lessons']) && is_string($course['completed_lessons'])) {
            $course['completed_lessons'] = json_decode($course['completed_lessons'], true);
        }

        return $course;
    }

    public function enroll($courseId, $userId) {
        $query = "INSERT INTO course_enrollments (course_id, user_id, enrolled_at) 
                  VALUES (:course_id, :user_id, NOW())";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':course_id', $courseId);
        $stmt->bindParam(':user_id', $userId);

        return $stmt->execute();
    }

    public function unenroll($courseId, $userId) {
        $query = "DELETE FROM course_enrollments 
                  WHERE course_id = :course_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':course_id', $courseId);
        $stmt->bindParam(':user_id', $userId);

        return $stmt->execute();
    }

    public function getUserCourses($userId) {
        $query = "SELECT c.*, ce.progress, ce.completed_lessons, ce.enrolled_at 
                  FROM " . $this->table . " c
                  JOIN course_enrollments ce ON c.id = ce.course_id
                  WHERE ce.user_id = :user_id
                  ORDER BY ce.enrolled_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        $courses = $stmt->fetchAll();
        foreach ($courses as &$course) {
            if (isset($course['modules'])) {
                $course['modules'] = is_string($course['modules']) ? json_decode($course['modules'], true) : $course['modules'];
            }
            if (isset($course['completed_lessons']) && is_string($course['completed_lessons'])) {
                $course['completed_lessons'] = json_decode($course['completed_lessons'], true);
            }
        }

        return $courses;
    }

    public function updateProgress($courseId, $userId, $progress, $completedLessons) {
        $query = "UPDATE course_enrollments 
                  SET progress = :progress, completed_lessons = :completed_lessons
                  WHERE course_id = :course_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':progress', $progress);
        $stmt->bindParam(':completed_lessons', $completedLessons);
        $stmt->bindParam(':course_id', $courseId);
        $stmt->bindParam(':user_id', $userId);

        return $stmt->execute();
    }

    public function updateUserXP($userId, $xpGained) {
        $query = "UPDATE users SET xp = xp + :xp_gained WHERE id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':xp_gained', $xpGained);
        $stmt->bindParam(':user_id', $userId);

        return $stmt->execute();
    }
}
