<?php
/**
 * Verify Complete Setup
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Setup Verification</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
        .btn:hover { background: #0056b3; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
<div class='container'>
    <h1>🔍 Setup Verification</h1>";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test 1: Database Connection
    echo "<div class='section'>";
    echo "<h2>✓ Database Connection</h2>";
    echo "<p class='success'>Connected successfully!</p>";
    echo "</div>";

    // Test 2: Check Tables
    echo "<div class='section'>";
    echo "<h2>Database Tables</h2>";
    $tables = ['users', 'educational_resources', 'curated_roadmaps', 'courses'];
    echo "<table>";
    echo "<tr><th>Table</th><th>Status</th><th>Row Count</th></tr>";
    
    foreach ($tables as $table) {
        $query = "SELECT COUNT(*) as count FROM $table";
        try {
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch();
            echo "<tr><td>$table</td><td class='success'>✓ Exists</td><td>{$result['count']}</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>$table</td><td class='error'>✗ Missing</td><td>-</td></tr>";
        }
    }
    echo "</table>";
    echo "</div>";

    // Test 3: Check Users
    echo "<div class='section'>";
    echo "<h2>Users</h2>";
    $query = "SELECT id, name, email, role, account_status FROM users ORDER BY role, id";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        echo "<table>";
        echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>";
        foreach ($users as $user) {
            $roleClass = $user['role'] === 'teacher' ? 'success' : ($user['role'] === 'admin' ? 'warning' : '');
            echo "<tr>";
            echo "<td>{$user['id']}</td>";
            echo "<td>{$user['name']}</td>";
            echo "<td>{$user['email']}</td>";
            echo "<td class='$roleClass'><strong>{$user['role']}</strong></td>";
            echo "<td>{$user['account_status']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='warning'>No users found in database.</p>";
    }
    echo "</div>";

    // Test 4: Check for Teacher User
    echo "<div class='section'>";
    echo "<h2>Teacher User Check</h2>";
    $query = "SELECT * FROM users WHERE email = 'teacher@test.com'";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $teacher = $stmt->fetch();
    
    if ($teacher) {
        if ($teacher['role'] === 'teacher' && $teacher['account_status'] === 'active') {
            echo "<p class='success'>✓ Teacher user exists and is properly configured!</p>";
            echo "<pre>" . json_encode([
                'id' => $teacher['id'],
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'role' => $teacher['role'],
                'status' => $teacher['account_status']
            ], JSON_PRETTY_PRINT) . "</pre>";
        } else {
            echo "<p class='warning'>⚠ Teacher user exists but needs configuration update</p>";
            echo "<p>Current role: {$teacher['role']}, Status: {$teacher['account_status']}</p>";
            echo "<a href='create-teacher-user.php' class='btn'>Fix Teacher User</a>";
        }
    } else {
        echo "<p class='error'>✗ Teacher user does not exist</p>";
        echo "<a href='create-teacher-user.php' class='btn'>Create Teacher User</a>";
    }
    echo "</div>";

    // Test 5: Check Resources
    echo "<div class='section'>";
    echo "<h2>Educational Resources</h2>";
    $query = "SELECT COUNT(*) as total, 
              SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
              SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
              FROM educational_resources";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $stats = $stmt->fetch();
    
    echo "<table>";
    echo "<tr><th>Status</th><th>Count</th></tr>";
    echo "<tr><td>Total</td><td>{$stats['total']}</td></tr>";
    echo "<tr><td>Approved</td><td class='success'>{$stats['approved']}</td></tr>";
    echo "<tr><td>Pending</td><td class='warning'>{$stats['pending']}</td></tr>";
    echo "<tr><td>Rejected</td><td class='error'>{$stats['rejected']}</td></tr>";
    echo "</table>";
    echo "</div>";

    // Test 6: Upload Directory
    echo "<div class='section'>";
    echo "<h2>Upload Directory</h2>";
    $uploadDir = __DIR__ . '/../uploads/resources/';
    if (file_exists($uploadDir)) {
        echo "<p class='success'>✓ Upload directory exists</p>";
        echo "<p>Path: $uploadDir</p>";
        
        $subdirs = ['documents', 'videos'];
        foreach ($subdirs as $subdir) {
            $path = $uploadDir . $subdir;
            if (file_exists($path)) {
                echo "<p class='success'>✓ $subdir/ exists</p>";
            } else {
                echo "<p class='warning'>⚠ $subdir/ missing (will be created on first upload)</p>";
            }
        }
    } else {
        echo "<p class='warning'>⚠ Upload directory missing (will be created on first upload)</p>";
    }
    echo "</div>";

    // Test 7: Quick Actions
    echo "<div class='section'>";
    echo "<h2>Quick Actions</h2>";
    echo "<a href='create-teacher-user.php' class='btn'>Create/Update Teacher User</a>";
    echo "<a href='test-teacher-resources.php' class='btn'>Test Resource System</a>";
    echo "<a href='test-auth-debug.php' class='btn'>Test Authentication</a>";
    echo "<a href='/test-resource-upload.html' class='btn'>Test Upload Page</a>";
    echo "</div>";

    // Test 8: Login Instructions
    echo "<div class='section'>";
    echo "<h2>📝 Next Steps</h2>";
    if ($teacher && $teacher['role'] === 'teacher') {
        echo "<ol>";
        echo "<li>Go to <a href='/test-resource-upload.html'>Test Upload Page</a></li>";
        echo "<li>Use these credentials:</li>";
        echo "<ul>";
        echo "<li><strong>Email:</strong> teacher@test.com</li>";
        echo "<li><strong>Password:</strong> teacher123</li>";
        echo "</ul>";
        echo "<li>Click 'Login' button</li>";
        echo "<li>Click 'Test Authentication' to verify</li>";
        echo "<li>Try uploading a resource</li>";
        echo "</ol>";
    } else {
        echo "<ol>";
        echo "<li>Click the 'Create/Update Teacher User' button above</li>";
        echo "<li>Then follow the instructions on that page</li>";
        echo "</ol>";
    }
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='section'>";
    echo "<h2 class='error'>Error</h2>";
    echo "<p class='error'>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";
}

echo "</div></body></html>";
?>
