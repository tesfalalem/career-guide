<?php
/**
 * Test all teacher endpoints to verify they're working
 */

echo "Testing Teacher Portal Endpoints\n";
echo "=================================\n\n";

// Test endpoints
$endpoints = [
    'GET /api/teacher/stats',
    'GET /api/teacher/activity', 
    'GET /api/teacher/at-risk-students',
    'GET /api/teacher/profile',
    'GET /api/teacher/analytics',
    'GET /api/notifications/unread-count'
];

// Get a teacher token
$loginUrl = 'http://localhost:8000/api/auth/login';
$loginData = json_encode([
    'email' => 'teacher@test.com',
    'password' => 'password123'
]);

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$loginResult = json_decode($response, true);

if (!isset($loginResult['token'])) {
    echo "✗ Failed to login\n";
    echo "Response: $response\n";
    exit(1);
}

$token = $loginResult['token'];
echo "✓ Logged in successfully\n\n";

// Test each endpoint
foreach ($endpoints as $endpoint) {
    list($method, $path) = explode(' ', $endpoint);
    $url = 'http://localhost:8000' . $path;
    
    echo "Testing: $endpoint\n";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo "  ✓ Status: $httpCode - SUCCESS\n";
        } else {
            echo "  ⚠ Status: $httpCode - Response: " . substr($response, 0, 100) . "\n";
        }
    } else {
        echo "  ✗ Status: $httpCode - FAILED\n";
        echo "  Response: " . substr($response, 0, 200) . "\n";
    }
    
    curl_close($ch);
    echo "\n";
}

echo "\n=================================\n";
echo "Testing Complete!\n";
