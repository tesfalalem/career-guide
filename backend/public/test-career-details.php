<?php
// Test Career Details API Endpoint

$apiUrl = 'http://localhost:8000/api/ai/career-details';

$data = [
    'career' => 'Software Engineer',
    'interest' => 'I love building web applications'
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

echo "Testing Career Details API...\n";
echo "URL: $apiUrl\n";
echo "Request: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT);
echo "\n";
