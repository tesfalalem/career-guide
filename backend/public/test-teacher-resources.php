<?php
/**
 * Test Teacher Resource Management System
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Models/User.php';
require_once __DIR__ . '/../app/Models/EducationalResource.php';

echo "<h1>Teacher Resource Management Test</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; padding: 10px; background: #d4edda; margin: 10px 0; }
    .error { color: red; padding: 10px; background: #f8d7da; margin: 10px 0; }
    pre { background: #f8f9fa; padding: 15px; }
</style>";

try {
    $userModel = new User();
    $resourceModel = new EducationalResource();

    // Test 1: Find teacher
    echo "<h2>Test 1: Find Teacher User</h2>";
    $teacher = $userModel->findByEmail('teacher@test.com');
    
    if (!$teacher) {
        echo "<div class='error'>No teacher found. Creating one...</div>";
        $teacherId = $userModel->create([
            'name' => 'Test Teacher',
            'email' => 'teacher@test.com',
            'password' => password_hash('teacher123', PASSWORD_BCRYPT),
            'role' => 'teacher'
        ]);
        $teacher = $userModel->findById($teacherId);
    }
    
    echo "<div class='success'>Teacher ID: {$teacher['id']}</div>";
    echo "<pre>" . json_encode($teacher, JSON_PRETTY_PRINT) . "</pre>";

    // Test 2: Create resource
    echo "<h2>Test 2: Create Resource</h2>";
    $resourceData = [
        'title' => 'Test Resource ' . time(),
        'description' => 'This is a test resource',
        'resource_type' => 'document',
        'category' => 'Frontend Development',
        'tags' => json_encode(['test', 'php']),
        'uploaded_by' => $teacher['id'],
        'status' => 'pending',
        'external_url' => 'https://example.com/test',
        'file_path' => null,
        'file_size' => 0,
        'file_type' => null
    ];
    
    $resourceId = $resourceModel->create($resourceData);
    echo "<div class='success'>Resource created with ID: {$resourceId}</div>";

    // Test 3: Get teacher resources
    echo "<h2>Test 3: Get Teacher Resources</h2>";
    $resources = $resourceModel->getByUploader($teacher['id']);
    echo "<div class='success'>Found " . count($resources) . " resources</div>";
    echo "<pre>" . json_encode($resources, JSON_PRETTY_PRINT) . "</pre>";

    // Test 4: Update resource
    echo "<h2>Test 4: Update Resource</h2>";
    $updateResult = $resourceModel->update($resourceId, [
        'title' => 'Updated Test Resource',
        'description' => 'This resource has been updated'
    ]);
    echo "<div class='success'>Resource updated: " . ($updateResult ? 'Yes' : 'No') . "</div>";

    // Test 5: Get statistics
    echo "<h2>Test 5: Resource Statistics</h2>";
    $stats = [
        'total' => 0,
        'approved' => 0,
        'pending' => 0,
        'rejected' => 0,
        'total_views' => 0,
        'total_downloads' => 0
    ];

    foreach ($resources as $resource) {
        $stats['total']++;
        $stats[$resource['status']]++;
        $stats['total_views'] += $resource['views'];
        $stats['total_downloads'] += $resource['downloads'];
    }

    echo "<pre>" . json_encode($stats, JSON_PRETTY_PRINT) . "</pre>";

    echo "<div class='success'>✓ All tests completed successfully!</div>";

} catch (Exception $e) {
    echo "<div class='error'>Error: " . $e->getMessage() . "</div>";
}
?>
