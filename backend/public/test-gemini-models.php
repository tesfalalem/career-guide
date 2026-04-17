<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$apiKey = $_ENV['GEMINI_API_KEY'] ?? '';

// List available models
$ch = curl_init("https://generativelanguage.googleapis.com/v1/models?key=$apiKey");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

header('Content-Type: application/json');
echo json_encode([
    'http_code' => $httpCode,
    'api_key_last_4' => substr($apiKey, -4),
    'response' => json_decode($response, true)
], JSON_PRETTY_PRINT);
