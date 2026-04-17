<?php
/**
 * Quick script to create test users with different roles
 * Access: http://localhost:8000/create-test-users.php
 */

// Load environment variables
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Password hash for "password"
    $passwordHash = password_hash('password', PASSWORD_BCRYPT);
    
    $results = [];
    
    // Create Admin User
    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, role, profile_completed, xp, streak, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE role = VALUES(role)
    ");
    
    $adminCreated = $stmt->execute([
        'Admin User',
        'admin@test.com',
        $passwordHash,
        'admin',
        1,
        0,
        0
    ]);
    $results['admin'] = $adminCreated ? 'Created/Updated' : 'Failed';
    
    // Create Teacher User
    $teacherCreated = $stmt->execute([
        'Teacher User',
        'teacher@test.com',
        $passwordHash,
        'teacher',
        1,
        0,
        0
    ]);
    $results['teacher'] = $teacherCreated ? 'Created/Updated' : 'Failed';
    
    // Create Student User
    $studentCreated = $stmt->execute([
        'Student User',
        'student@test.com',
        $passwordHash,
        'student',
        1,
        100,
        5
    ]);
    $results['student'] = $studentCreated ? 'Created/Updated' : 'Failed';
    
    // Get all users
    $stmt = $db->query("SELECT id, name, email, role, xp, streak FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Test users created/updated successfully',
        'results' => $results,
        'credentials' => [
            'admin' => ['email' => 'admin@test.com', 'password' => 'password'],
            'teacher' => ['email' => 'teacher@test.com', 'password' => 'password'],
            'student' => ['email' => 'student@test.com', 'password' => 'password']
        ],
        'all_users' => $users
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
