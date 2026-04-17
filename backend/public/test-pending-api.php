<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Test Pending Approvals API</h1>";

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
    
    echo "<h2>Checking for Pending Teacher Requests...</h2>";
    
    $stmt = $db->query("
        SELECT id, name, email, role, role_request, account_status, 
               institution, years_experience, requested_at, created_at
        FROM users 
        WHERE account_status = 'pending' AND role_request != role
        ORDER BY requested_at DESC
    ");
    
    $pendingUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p><strong>Found: " . count($pendingUsers) . " pending requests</strong></p>";
    
    if (count($pendingUsers) > 0) {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse; width:100%;'>";
        echo "<tr style='background: #f0f0f0;'>";
        echo "<th>ID</th><th>Name</th><th>Email</th><th>Current Role</th><th>Requested Role</th><th>Status</th><th>Institution</th><th>Requested At</th>";
        echo "</tr>";
        
        foreach ($pendingUsers as $user) {
            echo "<tr>";
            echo "<td>{$user['id']}</td>";
            echo "<td><strong>{$user['name']}</strong></td>";
            echo "<td>{$user['email']}</td>";
            echo "<td><span style='color:green'>{$user['role']}</span></td>";
            echo "<td><span style='color:blue; font-weight:bold'>{$user['role_request']}</span></td>";
            echo "<td><span style='color:orange; font-weight:bold'>{$user['account_status']}</span></td>";
            echo "<td>" . ($user['institution'] ?? '<em>N/A</em>') . "</td>";
            echo "<td>" . ($user['requested_at'] ?? $user['created_at']) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        echo "<div style='background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;'>";
        echo "<h2>✓ Pending Requests Found!</h2>";
        echo "<p>These users should appear in the admin 'Pending Approvals' tab.</p>";
        echo "<p><strong>Next step:</strong> Login as admin and check the 'Pending Approvals' tab.</p>";
        echo "</div>";
        
    } else {
        echo "<div style='background: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;'>";
        echo "<h2>⚠ No Pending Requests</h2>";
        echo "<p>No users found with <code>account_status='pending'</code> and <code>role_request != role</code></p>";
        echo "<p><strong>To create a test pending request:</strong></p>";
        echo "<ol>";
        echo "<li>Go to signup page</li>";
        echo "<li>Select 'Teacher' role</li>";
        echo "<li>Fill in teacher details</li>";
        echo "<li>Complete signup</li>";
        echo "</ol>";
        echo "</div>";
    }
    
    // Show all users for debugging
    echo "<h2>All Users (for debugging):</h2>";
    $stmt = $db->query("SELECT id, name, email, role, role_request, account_status FROM users ORDER BY id DESC LIMIT 10");
    $allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f0f0f0;'><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Role Request</th><th>Status</th></tr>";
    foreach ($allUsers as $user) {
        echo "<tr>";
        echo "<td>{$user['id']}</td>";
        echo "<td>{$user['name']}</td>";
        echo "<td>{$user['email']}</td>";
        echo "<td>{$user['role']}</td>";
        echo "<td>" . ($user['role_request'] ?? 'NULL') . "</td>";
        echo "<td>" . ($user['account_status'] ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
    echo "<h2>Error:</h2>";
    echo "<p style='color:red'>" . $e->getMessage() . "</p>";
    echo "</div>";
}
?>
