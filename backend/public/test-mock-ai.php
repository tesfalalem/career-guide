<?php
// Test mock AI functionality
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../app/Services/GeminiService.php';

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "Testing Mock AI Service\n";
echo "======================\n\n";

$gemini = new GeminiService();

echo "1. Testing Roadmap Generation...\n";
$roadmap = $gemini->generateRoadmap("Frontend Developer");
if ($roadmap) {
    echo "✅ Roadmap generated successfully!\n";
    echo "Title: " . $roadmap['title'] . "\n";
    echo "Phases: " . count($roadmap['phases']) . "\n\n";
} else {
    echo "❌ Roadmap generation failed\n\n";
}

echo "2. Testing Course Generation...\n";
$course = $gemini->generateCourse("Backend Developer");
if ($course) {
    echo "✅ Course generated successfully!\n";
    echo "Title: " . $course['title'] . "\n";
    echo "Modules: " . count($course['modules']) . "\n\n";
} else {
    echo "❌ Course generation failed\n\n";
}

echo "All tests complete!\n";
