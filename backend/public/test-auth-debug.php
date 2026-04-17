<?php
/**
 * Debug Authentication Issues
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Models/User.php';
require_once __DIR__ . '/../app/Helpers/JWTHelper.php';

$jwtHelper = new JWTHelper();

// Get headers
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

$response = [
    'headers_received' => $headers,
    'auth_header' => $authHeader,
    'token_extracted' => $token,
    'token_length' => strlen($token)
];

if (empty($token)) {
    $response['error'] = 'No token provided';
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

// Try to validate token
try {
    $decoded = $jwtHelper->validateToken($token);
    
    if (!$decoded) {
        $response['error'] = 'Token validation failed';
        $response['decoded'] = null;
    } else {
        $response['decoded'] = $decoded;
        $response['user_id'] = $decoded->user_id ?? null;
        
        // Try to get user
        if (isset($decoded->user_id)) {
            $userModel = new User();
            $user = $userModel->findById($decoded->user_id);
            
            if ($user) {
                $response['user_found'] = true;
                $response['user_role'] = $user['role'];
                $response['user_email'] = $user['email'];
            } else {
                $response['user_found'] = false;
                $response['error'] = 'User not found in database';
            }
        }
    }
} catch (Exception $e) {
    $response['error'] = 'Exception: ' . $e->getMessage();
    $response['trace'] = $e->getTraceAsString();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
