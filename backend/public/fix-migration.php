<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Fix Role Approval Migration</h1>";

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
    
    echo "<h2>Adding Columns One by One...</h2>";
    
    // Add each column individually with error handling
    $columns = [
        "ALTER TABLE users ADD COLUMN role_request ENUM('student', 'teacher', 'admin') DEFAULT 'student' AFTER role",
        "ALTER TABLE users ADD COLUMN account_status ENUM('pending', 'active', 'rejected') DEFAULT 'active' AFTER role_request",
        "ALTER TABLE users ADD COLUMN approval_notes TEXT NULL AFTER account_status",
        "ALTER TABLE users ADD COLUMN requested_at TIMESTAMP NULL AFTER approval_notes",
        "ALTER TABLE users ADD COLUMN approved_at TIMESTAMP NULL AFTER requested_at",
        "ALTER TABLE users ADD COLUMN approved_by INT NULL AFTER approved_at"
    ];
    
    foreach ($columns as $sql) {
        try {
            $db->exec($sql);
            preg_match('/ADD COLUMN (\w+)/', $sql, $matches);
            $colName = $matches[1] ?? 'column';
            echo "<p style='color:green'>✓ Added column: <strong>$colName</strong></p>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                preg_match('/ADD COLUMN (\w+)/', $sql, $matches);
                $colName = $matches[1] ?? 'column';
                echo "<p style='color:blue'>⚠ Column already exists: <strong>$colName</strong></p>";
            } else {
                echo "<p style='color:red'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
            }
        }
    }
    
    // Update existing users to have active status
    echo "<h2>Updating Existing Users...</h2>";
    try {
        $stmt = $db->exec("UPDATE users SET account_status = 'active' WHERE account_status IS NULL OR account_status = ''");
        echo "<p style='color:green'>✓ Updated existing users to 'active' status</p>";
    } catch (PDOException $e) {
        echo "<p style='color:orange'>⚠ " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
    // Add foreign key
    echo "<h2>Adding Foreign Key...</h2>";
    try {
        $db->exec("ALTER TABLE users ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL");
        echo "<p style='color:green'>✓ Added foreign key for approved_by</p>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            echo "<p style='color:blue'>⚠ Foreign key already exists</p>";
        } else {
            echo "<p style='color:orange'>⚠ Foreign key not added (not critical): " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    
    // Add indexes
    echo "<h2>Adding Indexes...</h2>";
    try {
        $db->exec("CREATE INDEX idx_account_status ON users(account_status)");
        echo "<p style='color:green'>✓ Added index: idx_account_status</p>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            echo "<p style='color:blue'>⚠ Index idx_account_status already exists</p>";
        } else {
            echo "<p style='color:orange'>⚠ " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    
    try {
        $db->exec("CREATE INDEX idx_role_request ON users(role_request)");
        echo "<p style='color:green'>✓ Added index: idx_role_request</p>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            echo "<p style='color:blue'>⚠ Index idx_role_request already exists</p>";
        } else {
            echo "<p style='color:orange'>⚠ " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    
    // Verify columns were added
    echo "<h2>Verifying Migration...</h2>";
    $stmt = $db->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $requiredColumns = ['role_request', 'account_status', 'approval_notes', 'requested_at', 'approved_at', 'approved_by'];
    $foundColumns = array_column($columns, 'Field');
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f0f0f0;'><th>Column</th><th>Status</th></tr>";
    
    $allGood = true;
    foreach ($requiredColumns as $col) {
        $exists = in_array($col, $foundColumns);
        if (!$exists) $allGood = false;
        $status = $exists ? "<span style='color:green; font-weight:bold'>✓ EXISTS</span>" : "<span style='color:red; font-weight:bold'>✗ MISSING</span>";
        echo "<tr><td><strong>$col</strong></td><td>$status</td></tr>";
    }
    
    echo "</table>";
    
    if ($allGood) {
        echo "<div style='background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;'>";
        echo "<h2 style='color: #2e7d32;'>✓ SUCCESS! Migration Complete!</h2>";
        echo "<p><strong>The role approval system is now ready.</strong></p>";
        echo "<h3>How It Works:</h3>";
        echo "<ul>";
        echo "<li>Users select 'Teacher' during signup → account created with <code>role='student'</code>, <code>account_status='pending'</code></li>";
        echo "<li>They can login but see student dashboard until approved</li>";
        echo "<li>Admin reviews in 'Pending Approvals' tab</li>";
        echo "<li>Upon approval → <code>role='teacher'</code>, <code>account_status='active'</code></li>";
        echo "<li>User must logout and login again to see teacher dashboard</li>";
        echo "</ul>";
        echo "</div>";
        
        echo "<div style='background: #e3f2fd; padding: 20px; margin: 20px 0; border-left: 4px solid #2196f3;'>";
        echo "<h2>Test It Now:</h2>";
        echo "<ol style='font-size: 16px;'>";
        echo "<li>Go to <strong>http://localhost:3000</strong></li>";
        echo "<li>Click 'Sign Up' and select <strong>'Teacher'</strong> role</li>";
        echo "<li>Fill in teacher details and complete signup</li>";
        echo "<li>You'll see student dashboard (because pending approval)</li>";
        echo "<li>Logout, then login as admin: <strong>admin@test.com / password</strong></li>";
        echo "<li>Go to <strong>'Pending Approvals'</strong> tab</li>";
        echo "<li>Approve the teacher request</li>";
        echo "<li>Logout, login with teacher account → see teacher dashboard!</li>";
        echo "</ol>";
        echo "</div>";
    } else {
        echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
        echo "<h2 style='color: #c62828;'>⚠ Migration Incomplete</h2>";
        echo "<p>Some columns are still missing. Please check the errors above.</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
    echo "<h2>Error:</h2>";
    echo "<p style='color:red'>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";
}
?>
