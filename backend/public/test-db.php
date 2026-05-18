<?php
require_once __DIR__ . '/../app/Config/Database.php';

try {
    $db = (new Database())->connect();
    $stmt = $db->query("SELECT * FROM course_enrollments");
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($enrollments, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
