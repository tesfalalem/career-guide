<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../app/Services/GeminiService.php';

header('Content-Type: application/json');

$gemini = new GeminiService();

echo "Testing Gemini API...\n\n";

// Test 1: Generate Roadmap
echo "1. Testing Roadmap Generation:\n";
$roadmap = $gemini->generateRoadmap("Full Stack Developer");

if ($roadmap) {
    echo "✅ SUCCESS! Roadmap generated\n";
    echo json_encode($roadmap, JSON_PRETTY_PRINT);
} else {
    echo "❌ FAILED! Could not generate roadmap\n";
}

echo "\n\n";

// Test 2: Generate Course
echo "2. Testing Course Generation:\n";
$course = $gemini->generateCourse("Full Stack Developer");

if ($course) {
    echo "✅ SUCCESS! Course generated\n";
    echo json_encode($course, JSON_PRETTY_PRINT);
} else {
    echo "❌ FAILED! Could not generate course\n";
}
