<?php
/**
 * Direct test of Analytics endpoint to see actual error
 */

// Enable error display
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing Analytics Controller directly...\n\n";

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Failed to connect to database\n");
}

echo "✓ Database connected\n";

// Load the controller
require_once __DIR__ . '/../app/Controllers/AnalyticsController.php';

echo "✓ AnalyticsController loaded\n";

// Try to instantiate it
try {
    $controller = new App\Controllers\AnalyticsController($db);
    echo "✓ AnalyticsController instantiated successfully\n";
    
    // Mock authentication by setting a fake Authorization header
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer fake_token_for_testing';
    
    echo "\nAttempting to call getTeacherAnalytics()...\n";
    
    // This will fail because we don't have a valid token, but we'll see the actual error
    $controller->getTeacherAnalytics();
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
