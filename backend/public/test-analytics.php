<?php
/**
 * Test Analytics API
 */

// Get a teacher token first
$loginUrl = 'http://localhost:8000/api/auth/login';
$loginData = [
    'email' => 'teacher@test.com',
    'password' => 'password123'
];

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$loginResponse = curl_exec($ch);
$loginData = json_decode($loginResponse, true);

if (!isset($loginData['token'])) {
    echo "Failed to login. Please ensure teacher@example.com exists.\n";
    echo "Response: " . $loginResponse . "\n";
    exit(1);
}

$token = $loginData['token'];
echo "✓ Logged in successfully\n\n";

// Test analytics endpoint
$analyticsUrl = 'http://localhost:8000/api/teacher/analytics';

$ch = curl_init($analyticsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);

echo "Testing: GET $analyticsUrl\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Status: $httpCode\n";
echo "Response:\n";
echo $response . "\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['success'])) {
        echo "\n✓ Analytics API working correctly!\n";
    } else {
        echo "\n✗ Invalid JSON response\n";
    }
} else {
    echo "\n✗ Analytics API returned error\n";
}

curl_close($ch);
