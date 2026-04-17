<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Add Teacher Profile Columns</h1>";

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
    
    echo "<h2>Adding Teacher Profile Columns...</h2>";
    
    // Teacher-specific columns
    $teacherColumns = [
        "ALTER TABLE users ADD COLUMN institution VARCHAR(255) NULL AFTER bio",
        "ALTER TABLE users ADD COLUMN years_experience INT NULL AFTER institution",
        "ALTER TABLE users ADD COLUMN expertise_areas JSON NULL AFTER years_experience",
        "ALTER TABLE users ADD COLUMN qualifications JSON NULL AFTER expertise_areas",
        "ALTER TABLE users ADD COLUMN bio TEXT NULL AFTER qualifications"
    ];
    
    // Student-specific columns
    $studentColumns = [
        "ALTER TABLE users ADD COLUMN student_id VARCHAR(100) NULL AFTER academic_year",
        "ALTER TABLE users ADD COLUMN department VARCHAR(255) NULL AFTER student_id",
        "ALTER TABLE users ADD COLUMN graduation_year INT NULL AFTER department"
    ];
    
    // Other columns
    $otherColumns = [
        "ALTER TABLE users ADD COLUMN role_preference ENUM('student', 'teacher') DEFAULT 'student' AFTER role",
        "ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE AFTER role_preference"
    ];
    
    $allColumns = array_merge($teacherColumns, $studentColumns, $otherColumns);
    
    foreach ($allColumns as $sql) {
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
    
    // Verify all columns
    echo "<h2>Verifying All Required Columns...</h2>";
    $stmt = $db->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $foundColumns = array_column($columns, 'Field');
    
    $requiredColumns = [
        // Role approval
        'role_request', 'account_status', 'approval_notes', 'requested_at', 'approved_at', 'approved_by',
        // Teacher profile
        'institution', 'years_experience', 'expertise_areas', 'qualifications', 'bio',
        // Student profile
        'student_id', 'department', 'graduation_year',
        // Other
        'role_preference', 'profile_completed'
    ];
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f0f0f0;'><th>Column</th><th>Status</th><th>Category</th></tr>";
    
    $allGood = true;
    foreach ($requiredColumns as $col) {
        $exists = in_array($col, $foundColumns);
        if (!$exists) $allGood = false;
        
        $category = 'Other';
        if (in_array($col, ['role_request', 'account_status', 'approval_notes', 'requested_at', 'approved_at', 'approved_by'])) {
            $category = 'Role Approval';
        } elseif (in_array($col, ['institution', 'years_experience', 'expertise_areas', 'qualifications', 'bio'])) {
            $category = 'Teacher Profile';
        } elseif (in_array($col, ['student_id', 'department', 'graduation_year'])) {
            $category = 'Student Profile';
        }
        
        $status = $exists ? "<span style='color:green; font-weight:bold'>✓ EXISTS</span>" : "<span style='color:red; font-weight:bold'>✗ MISSING</span>";
        echo "<tr><td><strong>$col</strong></td><td>$status</td><td>$category</td></tr>";
    }
    
    echo "</table>";
    
    if ($allGood) {
        echo "<div style='background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;'>";
        echo "<h2 style='color: #2e7d32;'>✓ ALL COLUMNS ADDED SUCCESSFULLY!</h2>";
        echo "<p>The database now has all required columns for:</p>";
        echo "<ul>";
        echo "<li><strong>Role Approval System:</strong> Teachers can request role, admins can approve</li>";
        echo "<li><strong>Teacher Profiles:</strong> Institution, experience, expertise, qualifications, bio</li>";
        echo "<li><strong>Student Profiles:</strong> Student ID, department, graduation year</li>";
        echo "</ul>";
        echo "<h3>Next Step:</h3>";
        echo "<p>Now try signing up with 'Teacher' role again. It should work!</p>";
        echo "</div>";
    } else {
        echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
        echo "<h2 style='color: #c62828;'>⚠ Some Columns Missing</h2>";
        echo "<p>Please check the errors above and try running this script again.</p>";
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
