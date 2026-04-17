<?php
/**
 * Check which tables exist in the database
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables in database:\n\n";
    
    $requiredTables = [
        'users',
        'educational_resources',
        'resource_access_logs',
        'student_resource_progress',
        'feedback_messages',
        'student_engagement_metrics',
        'notifications',
        'notification_preferences'
    ];
    
    foreach ($requiredTables as $table) {
        $exists = in_array($table, $tables);
        $status = $exists ? '✓' : '✗';
        echo "$status $table\n";
    }
    
    echo "\nTotal tables: " . count($tables) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
