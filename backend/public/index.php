<?php
/**
 * CareerGuide API - Entry Point
 * All requests are routed through this file
 */

// Log errors but never display them as HTML in API responses
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Polyfill for getallheaders() if it doesn't exist
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            } elseif ($name == 'CONTENT_TYPE') {
                $headers['Content-Type'] = $value;
            } elseif ($name == 'CONTENT_LENGTH') {
                $headers['Content-Length'] = $value;
            }
        }
        // Specific check for Authorization header which is often missing in PHP CGI/FastCGI
        if (!isset($headers['Authorization'])) {
            if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['PHP_AUTH_USER'])) {
                $pw = $_SERVER['PHP_AUTH_PW'] ?? '';
                $headers['Authorization'] = 'Basic ' . base64_encode($_SERVER['PHP_AUTH_USER'] . ':' . $pw);
            } elseif (isset($_SERVER['PHP_AUTH_DIGEST'])) {
                $headers['Authorization'] = $_SERVER['PHP_AUTH_DIGEST'];
            }
        }
        return $headers;
    }
}

// CORS headers - Allow frontend and mobile app
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8000',
    'http://localhost:57264',  // Flutter web dev port
    'http://localhost:57265',
    'http://localhost:57266',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// Allow any localhost port (Flutter web uses random ports)
$isLocalhost = preg_match('/^http:\/\/localhost(:\d+)?$/', $origin);
// Allow any device on the same LAN subnets (university network + home/lab networks)
$isLanDevice = preg_match('/^http:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/', $origin);
if (in_array($origin, $allowedOrigins) || $isLocalhost || $isLanDevice) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
} else {
    // For mobile apps that don't send Origin header, allow all
    header('Access-Control-Allow-Origin: *');
}
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
