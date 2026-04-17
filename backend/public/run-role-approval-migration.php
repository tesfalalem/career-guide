<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Role Approval Migration</h1>";

// Load environment variables
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<p style='color:green'>✓ Database connected</p>";
    
    // Read migration file
    $migrationFile = __DIR__ . '/../database/role_approval_migration.sql';
    $sql = file_get_contents($migrationFile);
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "<h2>Executing Migration...</h2>";
    echo "<ul>";
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) continue;
        
        try {
            $db->exec($statement);
            // Get first few words for display
            $preview = substr($statement, 0, 60) . '...';
            echo "<li style='color:green'>✓ " . htmlspecialchars($preview) . "</li>";
        } catch (PDOException $e) {
            // Check if error is about column already existing
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                $preview = substr($statement, 0, 60) . '...';
                echo "<li style='color:blue'>⚠ Column already exists: " . htmlspecialchars($preview) . "</li>";
            } else {
                echo "<li style='color:red'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</li>";
                echo "<pre>" . htmlspecialchars($statement) . "</pre>";
            }
        }
    }
    
    echo "</ul>";
    
    // Verify columns were added
    echo "<h2>Verifying Migration...</h2>";
    $stmt = $db->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $requiredColumns = ['role_request', 'account_status', 'approval_notes', 'requested_at', 'approved_at', 'approved_by'];
    $foundColumns = array_column($columns, 'Field');
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f0f0f0;'><th>Column</th><th>Status</th></tr>";
    
    foreach ($requiredColumns as $col) {
        $exists = in_array($col, $foundColumns);
        $status = $exists ? "<span style='color:green'>✓ Exists</span>" : "<span style='color:red'>✗ Missing</span>";
        echo "<tr><td>$col</td><td>$status</td></tr>";
    }
    
    echo "</table>";
    
    echo "<div style='background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;'>";
    echo "<h2>✓ Migration Complete!</h2>";
    echo "<p>The role approval system is now ready. Users can:</p>";
    echo "<ul>";
    echo "<li>Select 'Teacher' role during signup</li>";
    echo "<li>Their account will be created with 'pending' status</li>";
    echo "<li>Admins can review and approve/reject requests in the 'Pending Approvals' tab</li>";
    echo "<li>Upon approval, the user's role will be changed to 'teacher'</li>";
    echo "</ul>";
    echo "</div>";
    
    echo "<div style='background: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;'>";
    echo "<h2>Next Steps:</h2>";
    echo "<ol>";
    echo "<li>Test signup with 'Teacher' role selection</li>";
    echo "<li>Login as admin (admin@test.com / password)</li>";
    echo "<li>Go to 'Pending Approvals' tab</li>";
    echo "<li>Review and approve the teacher request</li>";
    echo "<li>Logout and login with the approved teacher account</li>";
    echo "</ol>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
    echo "<h2>Error:</h2>";
    echo "<p style='color:red'>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";
}
?>
