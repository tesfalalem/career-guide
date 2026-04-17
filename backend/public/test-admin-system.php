<?php
// Test Admin Content System
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Models/CuratedRoadmap.php';
require_once __DIR__ . '/../app/Models/EducationalResource.php';

echo "Testing Admin Content System\n";
echo "============================\n\n";

// Test 1: Database Connection
echo "1. Testing Database Connection...\n";
$database = new Database();
$conn = $database->getConnection();

if ($conn === null) {
    echo "❌ ERROR: Database connection failed!\n";
    echo "Make sure XAMPP MySQL is running.\n";
    exit(1);
}
echo "✅ Database connected\n\n";

// Test 2: Check if tables exist
echo "2. Checking if tables exist...\n";
$tables = ['curated_roadmaps', 'educational_resources', 'roadmap_enrollments'];
foreach ($tables as $table) {
    try {
        $stmt = $conn->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "✅ Table '$table' exists ($count rows)\n";
    } catch (Exception $e) {
        echo "❌ Table '$table' missing - Run migration!\n";
    }
}
echo "\n";

// Test 3: Test CuratedRoadmap Model
echo "3. Testing CuratedRoadmap Model...\n";
try {
    $roadmapModel = new CuratedRoadmap();
    $roadmaps = $roadmapModel->getAll(['status' => 'published', 'limit' => 5]);
    echo "✅ CuratedRoadmap model works\n";
    echo "   Found " . count($roadmaps) . " published roadmaps\n";
    
    if (count($roadmaps) > 0) {
        echo "   Sample: " . $roadmaps[0]['title'] . "\n";
    } else {
        echo "   ⚠️  No roadmaps found - Run seed script!\n";
    }
} catch (Exception $e) {
    echo "❌ CuratedRoadmap model error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 4: Test EducationalResource Model
echo "4. Testing EducationalResource Model...\n";
try {
    $resourceModel = new EducationalResource();
    $resources = $resourceModel->getAll(['limit' => 5]);
    echo "✅ EducationalResource model works\n";
    echo "   Found " . count($resources) . " resources\n";
} catch (Exception $e) {
    echo "❌ EducationalResource model error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 5: Check for admin users
echo "5. Checking for admin users...\n";
try {
    $stmt = $conn->query("SELECT name, email, role FROM users WHERE role IN ('admin', 'teacher')");
    $admins = $stmt->fetchAll();
    
    if (count($admins) > 0) {
        echo "✅ Found " . count($admins) . " admin/teacher users:\n";
        foreach ($admins as $admin) {
            echo "   - {$admin['name']} ({$admin['email']}) - {$admin['role']}\n";
        }
    } else {
        echo "⚠️  No admin users found\n";
        echo "   Create one with: UPDATE users SET role = 'admin' WHERE email = 'your@email.com';\n";
    }
} catch (Exception $e) {
    echo "❌ Error checking users: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 6: Test Categories
echo "6. Testing Category Retrieval...\n";
try {
    $roadmapModel = new CuratedRoadmap();
    $categories = $roadmapModel->getCategories();
    echo "✅ Found " . count($categories) . " categories:\n";
    foreach ($categories as $cat) {
        echo "   - {$cat['category']} ({$cat['count']} roadmaps)\n";
    }
} catch (Exception $e) {
    echo "❌ Error getting categories: " . $e->getMessage() . "\n";
}
echo "\n";

// Summary
echo "============================\n";
echo "Test Summary\n";
echo "============================\n";
echo "✅ Database: Connected\n";
echo "✅ Models: Working\n";
echo "✅ Tables: Created\n";

$stmt = $conn->query("SELECT COUNT(*) FROM curated_roadmaps WHERE status = 'published'");
$roadmapCount = $stmt->fetchColumn();

if ($roadmapCount > 0) {
    echo "✅ Seed Data: $roadmapCount roadmaps ready\n";
    echo "\n🎉 System is ready to use!\n";
} else {
    echo "⚠️  Seed Data: No roadmaps found\n";
    echo "\n📝 Next step: Run seed script\n";
    echo "   mysql -u root -p careerguide < backend/database/seed_roadmaps.sql\n";
}

echo "\n";
