<?php
// Test database connection
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

echo "Testing Database Connection\n";
echo "===========================\n\n";

echo "Environment Variables:\n";
echo "DB_HOST: " . ($_ENV['DB_HOST'] ?? 'not set') . "\n";
echo "DB_NAME: " . ($_ENV['DB_NAME'] ?? 'not set') . "\n";
echo "DB_USER: " . ($_ENV['DB_USER'] ?? 'not set') . "\n";
echo "DB_PASS: " . (empty($_ENV['DB_PASS']) ? '(empty)' : '(set)') . "\n\n";

echo "Creating Database instance...\n";
$database = new Database();

echo "Getting connection...\n";
$conn = $database->getConnection();

if ($conn === null) {
    echo "❌ ERROR: Connection is NULL!\n";
    exit(1);
}

echo "✅ Connection successful!\n";
echo "Connection type: " . get_class($conn) . "\n\n";

// Test query
try {
    $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Query successful! Users in database: " . $result['count'] . "\n";
} catch (Exception $e) {
    echo "❌ Query failed: " . $e->getMessage() . "\n";
}
