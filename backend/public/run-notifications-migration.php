<?php
/**
 * Run Notifications System Migration
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

try {
    echo "Starting notifications system migration...\n\n";
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Could not connect to database");
    }
    
    // Read the migration SQL file
    $sql = file_get_contents(__DIR__ . '/../database/notifications_system.sql');
    
    if ($sql === false) {
        throw new Exception("Could not read migration file");
    }
    
    // Execute the migration
    $db->exec($sql);
    
    echo "✓ Notifications system migration completed successfully!\n";
    echo "✓ Created tables: notifications, notification_preferences\n";
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
