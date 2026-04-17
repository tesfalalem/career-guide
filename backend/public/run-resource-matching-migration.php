<?php
// Run Resource-Roadmap Matching Migration

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Starting Resource-Roadmap Matching Migration...\n\n";
    
    // Read the migration file
    $migrationFile = __DIR__ . '/../database/resource_roadmap_matching.sql';
    
    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }
    
    $sql = file_get_contents($migrationFile);
    
    // Split by delimiter changes and execute
    $statements = preg_split('/DELIMITER\s+/i', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        // Handle different delimiters
        if (strpos($statement, '//') !== false) {
            $parts = explode('//', $statement);
            foreach ($parts as $part) {
                $part = trim($part);
                if (empty($part) || $part === 'DELIMITER') continue;
                
                try {
                    $db->exec($part);
                    echo "✓ Executed statement\n";
                } catch (PDOException $e) {
                    // Ignore "already exists" errors
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        echo "⚠ Warning: " . $e->getMessage() . "\n";
                    }
                }
            }
        } else {
            // Regular SQL statements
            $queries = array_filter(array_map('trim', explode(';', $statement)));
            foreach ($queries as $query) {
                if (empty($query)) continue;
                
                try {
                    $db->exec($query);
                    echo "✓ Executed: " . substr($query, 0, 50) . "...\n";
                } catch (PDOException $e) {
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        echo "⚠ Warning: " . $e->getMessage() . "\n";
                    }
                }
            }
        }
    }
    
    echo "\n✅ Migration completed successfully!\n\n";
    
    // Test the auto-matching function
    echo "Testing auto-match functionality...\n";
    
    // Get a sample approved resource
    $stmt = $db->query("SELECT id, title, category FROM educational_resources WHERE status = 'approved' LIMIT 1");
    $resource = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($resource) {
        echo "Sample resource: {$resource['title']} (Category: {$resource['category']})\n";
        
        // Call the auto-match procedure
        try {
            $db->exec("CALL auto_match_resources({$resource['id']})");
            echo "✓ Auto-match procedure executed successfully\n";
        } catch (PDOException $e) {
            echo "⚠ Auto-match test: " . $e->getMessage() . "\n";
        }
    } else {
        echo "No approved resources found for testing\n";
    }
    
    // Show matched resources
    echo "\nCurrent resource-roadmap matches:\n";
    $stmt = $db->query("
        SELECT 
            roadmap_title,
            resource_title,
            auto_matched,
            match_score
        FROM resource_roadmap_matches
        LIMIT 5
    ");
    
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($matches) > 0) {
        foreach ($matches as $match) {
            $autoFlag = $match['auto_matched'] ? '🤖 AUTO' : '👤 MANUAL';
            echo "  $autoFlag: {$match['resource_title']} → {$match['roadmap_title']}\n";
        }
    } else {
        echo "  No matches found yet\n";
    }
    
    echo "\n✅ All done!\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    http_response_code(500);
}
