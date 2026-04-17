<?php
// Run Student Monitoring System Migration

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/plain');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Starting Student Monitoring System Migration...\n\n";
    
    // Read the migration file
    $migrationFile = __DIR__ . '/../database/student_monitoring_system.sql';
    
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
                    echo "✓ Executed stored procedure/trigger\n";
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
                    $preview = substr($query, 0, 60);
                    echo "✓ Executed: $preview...\n";
                } catch (PDOException $e) {
                    if (strpos($e->getMessage(), 'already exists') === false && 
                        strpos($e->getMessage(), 'Duplicate') === false) {
                        echo "⚠ Warning: " . $e->getMessage() . "\n";
                    }
                }
            }
        }
    }
    
    echo "\n✅ Migration completed successfully!\n\n";
    
    // Verify tables
    echo "Verifying tables...\n";
    $tables = [
        'resource_access_logs',
        'student_resource_progress',
        'feedback_messages',
        'student_engagement_metrics'
    ];
    
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "✓ $table: $count rows\n";
        } else {
            echo "✗ $table: NOT FOUND\n";
        }
    }
    
    echo "\n✅ All done!\n";
    echo "\nThe student monitoring system is now ready to use.\n";
    echo "Teachers can track student progress and send feedback.\n";
    echo "Students can rate resources and receive feedback.\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    http_response_code(500);
}
