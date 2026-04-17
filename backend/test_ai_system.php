<?php

/**
 * AI System Test Script
 * Verifies the Multi-Provider AI Architecture and Fallback logic.
 */

// Load environment variables manually for the test
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

require_once __DIR__ . '/app/Services/AiService.php';

function test_system() {
    $aiService = new AiService();
    
    echo "--- AI System Verification ---\n";
    
    // 1. Test Career Suggestion (JSON Output)
    echo "Testing Career Suggestion (JSON)...\n";
    $suggestion = $aiService->generateCareerSuggestion("I love building user interfaces and working with React.");
    
    if ($suggestion && isset($suggestion['career'])) {
        echo "✅ SUCCESS: Career suggested: " . $suggestion['career'] . "\n";
    } else {
        echo "❌ FAILED: Career suggestion failed.\n";
    }
    
    echo "\n";
    
    // 2. Test Lesson Content (Markdown Output)
    echo "Testing Lesson Content (Markdown)...\n";
    $content = $aiService->generateLessonContent("Introduction to React Components", "Foundations", "Modern Frontend Development");
    
    if ($content && strpos($content, '##') !== false) {
        echo "✅ SUCCESS: Lesson content generated (Markdown structure detected).\n";
        echo "Content preview: " . substr($content, 0, 100) . "...\n";
    } else {
        echo "❌ FAILED: Lesson content generation failed.\n";
    }

    echo "\n--- Test Complete ---\n";
}

// Check if running from CLI
if (php_sapi_name() === 'cli') {
    test_system();
} else {
    echo "Please run this script from the terminal: php backend/test_ai_system.php";
}
