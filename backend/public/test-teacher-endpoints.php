<?php
// Test script to verify teacher endpoints are working
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Database connection
try {
    $db = new PDO(
        "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'] . ";charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✓ Database connected\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

// Find a teacher user
$stmt = $db->query("SELECT id, name, email FROM users WHERE role = 'teacher' LIMIT 1");
$teacher = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$teacher) {
    die("✗ No teacher user found in database\n");
}

echo "✓ Found teacher: {$teacher['name']} (ID: {$teacher['id']})\n";

// Generate JWT token
$payload = [
    'id' => $teacher['id'],
    'email' => $teacher['email'],
    'role' => 'teacher'
];
$token = \Firebase\JWT\JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
echo "✓ Generated JWT token\n";

// Test endpoints
$baseUrl = 'http://localhost:8000/api/teacher';
$headers = [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
];

$endpoints = [
    'profile' => '/profile',
    'at-risk-students' => '/at-risk-students',
    'analytics' => '/analytics',
    'activity' => '/activity'
];

echo "\nTesting endpoints:\n";
echo str_repeat('-', 50) . "\n";

foreach ($endpoints as $name => $path) {
    $ch = curl_init($baseUrl . $path);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $status = $httpCode === 200 ? '✓' : '✗';
    echo "$status $name: HTTP $httpCode\n";
    
    if ($httpCode !== 200) {
        $data = json_decode($response, true);
        if (isset($data['error'])) {
            echo "  Error: {$data['error']}\n";
        }
    }
}

echo str_repeat('-', 50) . "\n";
echo "\nIf you see errors above, restart the backend server:\n";
echo "cd careerguide-frontend/backend/public && php -S localhost:8000\n";
