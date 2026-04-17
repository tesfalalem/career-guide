<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Fix User Roles</h1>";

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
    
    echo "<h2>Current Users:</h2>";
    $stmt = $db->query("SELECT id, name, email, role FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f0f0f0;'><th>ID</th><th>Name</th><th>Email</th><th>Current Role</th></tr>";
    foreach ($users as $user) {
        $color = $user['role'] === 'admin' ? 'red' : ($user['role'] === 'teacher' ? 'blue' : 'green');
        echo "<tr>";
        echo "<td>{$user['id']}</td>";
        echo "<td>{$user['name']}</td>";
        echo "<td>{$user['email']}</td>";
        echo "<td><strong style='color:$color'>{$user['role']}</strong></td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>Creating/Updating Test Accounts:</h2>";
    
    $passwordHash = password_hash('password', PASSWORD_BCRYPT);
    
    // Check and create/update test accounts
    $testAccounts = [
        ['admin@test.com', 'Admin User', 'admin'],
        ['teacher@test.com', 'Teacher User', 'teacher'],
        ['student@test.com', 'Student User', 'student']
    ];
    
    foreach ($testAccounts as $account) {
        list($email, $name, $role) = $account;
        
        // Check if exists
        $stmt = $db->prepare("SELECT id, role FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update role
            $stmt = $db->prepare("UPDATE users SET role = ?, name = ? WHERE email = ?");
            $stmt->execute([$role, $name, $email]);
            echo "<p style='color:blue'>✓ Updated <strong>$email</strong> from '{$existing['role']}' to '<strong>$role</strong>'</p>";
        } else {
            // Get table columns first
            $stmt = $db->query("SHOW COLUMNS FROM users");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Build insert query based on available columns
            $insertCols = ['name', 'email', 'password', 'role'];
            $insertVals = [$name, $email, $passwordHash, $role];
            $placeholders = ['?', '?', '?', '?'];
            
            if (in_array('created_at', $columns)) {
                $insertCols[] = 'created_at';
                $insertVals[] = date('Y-m-d H:i:s');
                $placeholders[] = '?';
            }
            
            if (in_array('xp', $columns)) {
                $insertCols[] = 'xp';
                $insertVals[] = 0;
                $placeholders[] = '?';
            }
            
            if (in_array('streak', $columns)) {
                $insertCols[] = 'streak';
                $insertVals[] = 0;
                $placeholders[] = '?';
            }
            
            $sql = "INSERT INTO users (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $db->prepare($sql);
            $stmt->execute($insertVals);
            echo "<p style='color:green'>✓ Created <strong>$email</strong> with role '<strong>$role</strong>'</p>";
        }
    }
    
    echo "<h2>Updated User List:</h2>";
    $stmt = $db->query("SELECT id, name, email, role FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f0f0f0;'><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
    foreach ($users as $user) {
        $color = $user['role'] === 'admin' ? 'red' : ($user['role'] === 'teacher' ? 'blue' : 'green');
        echo "<tr>";
        echo "<td>{$user['id']}</td>";
        echo "<td>{$user['name']}</td>";
        echo "<td>{$user['email']}</td>";
        echo "<td><strong style='color:$color'>{$user['role']}</strong></td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<div style='background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;'>";
    echo "<h2>✓ Success! Test Accounts Ready</h2>";
    echo "<h3>Login Credentials:</h3>";
    echo "<ul style='font-size: 16px;'>";
    echo "<li><strong style='color:red'>Admin:</strong> admin@test.com / password</li>";
    echo "<li><strong style='color:blue'>Teacher:</strong> teacher@test.com / password</li>";
    echo "<li><strong style='color:green'>Student:</strong> student@test.com / password</li>";
    echo "</ul>";
    echo "</div>";
    
    echo "<div style='background: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;'>";
    echo "<h2>⚠️ Important: Clear Browser Cache</h2>";
    echo "<ol style='font-size: 16px;'>";
    echo "<li><strong>Logout</strong> from your current account</li>";
    echo "<li>Press <strong>F12</strong> to open Developer Console</li>";
    echo "<li>Go to <strong>Console</strong> tab</li>";
    echo "<li>Type: <code style='background:#f0f0f0; padding:2px 5px;'>localStorage.clear()</code> and press Enter</li>";
    echo "<li><strong>Refresh</strong> the page (F5)</li>";
    echo "<li><strong>Login</strong> with one of the test accounts above</li>";
    echo "</ol>";
    echo "</div>";
    
    echo "<div style='background: #e3f2fd; padding: 20px; margin: 20px 0; border-left: 4px solid #2196f3;'>";
    echo "<h2>What You Should See:</h2>";
    echo "<ul style='font-size: 16px;'>";
    echo "<li><strong style='color:red'>Admin Dashboard:</strong> Red sidebar, 'Admin Portal' title, User Management, Content Moderation</li>";
    echo "<li><strong style='color:blue'>Teacher Dashboard:</strong> Blue sidebar, 'Teacher Portal' title, Resource Management, Student Analytics</li>";
    echo "<li><strong style='color:green'>Student Dashboard:</strong> Top navigation bar, XP/Streak display, Learning features</li>";
    echo "</ul>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
    echo "<h2>Error:</h2>";
    echo "<p style='color:red'>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";
}
?>
