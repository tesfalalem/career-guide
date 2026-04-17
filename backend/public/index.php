<?php
/**
 * CareerGuide API - Entry Point
 * All requests are routed through this file
 */

// Log errors but never display them as HTML in API responses
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// CORS headers - Allow frontend on port 3000
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Don't set JSON content-type for file serve requests — UploadController::serve() sets its own
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (strpos($uri, '/api/uploads/serve') === false) {
    header('Content-Type: application/json');
}

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

// Initialize database connection as global
$database = new Database();
$db = $database->getConnection();

require_once __DIR__ . '/../routes/api.php';

// Start routing
$router = new Router();
$router->dispatch();
