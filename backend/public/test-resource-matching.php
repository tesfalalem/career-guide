<?php
// Test Resource-Roadmap Matching System

require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/plain');

echo "=== Resource-Roadmap Matching System Test ===\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // 1. Check if tables exist
    echo "1. Checking database tables...\n";
    $tables = ['educational_resources', 'curated_roadmaps', 'roadmap_resources'];
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "   ✓ Table '$table' exists\n";
        } else {
            echo "   ✗ Table '$table' NOT FOUND\n";
        }
    }
    
    // 2. Check for auto_matched column
    echo "\n2. Checking roadmap_resources structure...\n";
    $stmt = $db->query("DESCRIBE roadmap_resources");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $requiredColumns = ['auto_matched', 'match_score', 'matched_at'];
    foreach ($requiredColumns as $col) {
        if (in_array($col, $columns)) {
            echo "   ✓ Column '$col' exists\n";
        } else {
            echo "   ✗ Column '$col' NOT FOUND (run migration)\n";
        }
    }
    
    // 3. Check stored procedure
    echo "\n3. Checking stored procedure...\n";
    $stmt = $db->query("SHOW PROCEDURE STATUS WHERE Name = 'auto_match_resources'");
    if ($stmt->rowCount() > 0) {
        echo "   ✓ Stored procedure 'auto_match_resources' exists\n";
    } else {
        echo "   ✗ Stored procedure NOT FOUND (run migration)\n";
    }
    
    // 4. Check view
    echo "\n4. Checking view...\n";
    $stmt = $db->query("SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_careerguide = 'resource_roadmap_matches'");
    if ($stmt->rowCount() > 0) {
        echo "   ✓ View 'resource_roadmap_matches' exists\n";
    } else {
        echo "   ✗ View NOT FOUND (run migration)\n";
    }
    
    // 5. Show current data
    echo "\n5. Current data summary...\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM educational_resources");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "   Resources: $count total\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM educational_resources WHERE status = 'approved'");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "   Resources: $count approved\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM curated_roadmaps");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "   Roadmaps: $count total\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM curated_roadmaps WHERE status = 'published'");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "   Roadmaps: $count published\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM roadmap_resources");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "   Resource-Roadmap Links: $count total\n";
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM roadmap_resources WHERE auto_matched = TRUE");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "   Auto-matched Links: $count\n";
    } catch (PDOException $e) {
        echo "   Auto-matched Links: N/A (column not found)\n";
    }
    
    // 6. Show sample matches
    echo "\n6. Sample resource-roadmap matches...\n";
    try {
        $stmt = $db->query("
            SELECT 
                er.title as resource,
                er.category as res_cat,
                cr.title as roadmap,
                cr.category as road_cat,
                rr.auto_matched
            FROM roadmap_resources rr
            JOIN educational_resources er ON rr.resource_id = er.id
            JOIN curated_roadmaps cr ON rr.roadmap_id = cr.id
            LIMIT 5
        ");
        
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($matches) > 0) {
            foreach ($matches as $match) {
                $flag = isset($match['auto_matched']) && $match['auto_matched'] ? '🤖' : '👤';
                echo "   $flag {$match['resource']} ({$match['res_cat']}) → {$match['roadmap']} ({$match['road_cat']})\n";
            }
        } else {
            echo "   No matches found\n";
        }
    } catch (PDOException $e) {
        echo "   Error: " . $e->getMessage() . "\n";
    }
    
    // 7. Test API endpoints
    echo "\n7. Testing API endpoints...\n";
    
    // Get a sample resource
    $stmt = $db->query("SELECT id FROM educational_resources WHERE status = 'approved' LIMIT 1");
    $resource = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($resource) {
        echo "   Sample resource ID: {$resource['id']}\n";
        echo "   Test endpoint: GET /api/resources/{$resource['id']}/roadmaps\n";
        echo "   Test endpoint: POST /api/resources/{$resource['id']}/auto-match\n";
    } else {
        echo "   No approved resources found for testing\n";
    }
    
    // Get a sample roadmap
    $stmt = $db->query("SELECT id FROM curated_roadmaps WHERE status = 'published' LIMIT 1");
    $roadmap = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($roadmap) {
        echo "   Sample roadmap ID: {$roadmap['id']}\n";
        echo "   Test endpoint: GET /api/curated-roadmaps/{$roadmap['id']}/resources\n";
    } else {
        echo "   No published roadmaps found for testing\n";
    }
    
    echo "\n✅ Test completed!\n";
    echo "\nNext steps:\n";
    echo "1. Run migration: php run-resource-matching-migration.php\n";
    echo "2. Create some roadmaps with categories\n";
    echo "3. Upload resources with matching categories\n";
    echo "4. Resources will auto-match when approved\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}
