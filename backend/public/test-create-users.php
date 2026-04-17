<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Testing User Creation</h1>";

// Load environment variables
$envFile = __DIR__ . '/../.env';
echo "<p>Loading .env from: $envFile</p>";
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    echo "<p style='color:green'>✓ .env loaded</p>";
} else {
    echo "<p style='color:red'>✗ .env not found</p>";
}

require_once __DIR__ . '/../config/database.php';
echo "<p style='color:green'>✓ Database class loaded</p>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "<p style='color:green'>✓ Database connected</p>";
        
        // Check if users table exists
        $stmt = $db->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() > 0) {
            echo "<p style='color:green'>✓ Users table exists</p>";
            
            // Show current users
            $stmt = $db->query("SELECT id, name, email, role FROM users");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "<h2>Current Users:</h2>";
            echo "<table border='1' cellpadding='5'>";
            echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
            foreach ($users as $user) {
                echo "<tr>";
                echo "<td>{$user['id']}</td>";
                echo "<td>{$user['name']}</td>";
                echo "<td>{$user['email']}</td>";
                echo "<td><strong>{$user['role']}</strong></td>";
                echo "</tr>";
            }
            echo "</table>";
            
            // Now create test users
            echo "<h2>Creating Test Users...</h2>";
            $passwordHash = password_hash('password', PASSWORD_BCRYPT);
            
            $testUsers = [
                ['Admin User', 'admin@test.com', 'admin'],
                ['Teacher User', 'teacher@test.com', 'teacher'],
                ['Student User', 'student@test.com', 'student']
            ];
            
            foreach ($testUsers as $userData) {
                list($name, $email, $role) = $userData;
                
                // Check if user exists
                $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$email]);
                
                if ($stmt->rowCount() > 0) {
                    // Update existing user
                    $stmt = $db->prepare("UPDATE users SET role = ?, name = ? WHERE email = ?");
                    $stmt->execute([$role, $name, $email]);
                    echo "<p style='color:blue'>✓ Updated $email to role: $role</p>";
                } else {
                    // Create new user
                    $stmt = $db->prepare("
                        INSERT INTO users (name, email, password, role, profile_completed, xp, streak, created_at) 
                        VALUES (?, ?, ?, ?, 1, 0, 0, NOW())
                    ");
                    $stmt->execute([$name, $email, $passwordHash, $role]);
                    echo "<p style='color:green'>✓ Created $email with role: $role</p>";
                }
            }
            
            // Show updated users
            $stmt = $db->query("SELECT id, name, email, role FROM users");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "<h2>Updated Users:</h2>";
            echo "<table border='1' cellpadding='5'>";
            echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
            foreach ($users as $user) {
                echo "<tr>";
                echo "<td>{$user['id']}</td>";
                echo "<td>{$user['name']}</td>";
                echo "<td>{$user['email']}</td>";
                echo "<td><strong style='color:" . ($user['role'] === 'admin' ? 'red' : ($user['role'] === 'teacher' ? 'blue' : 'green')) . "'>{$user['role']}</strong></td>";
                echo "</tr>";
            }
            echo "</table>";
            
            echo "<h2>Test Credentials:</h2>";
            echo "<ul>";
            echo "<li><strong>Admin:</strong> admin@test.com / password</li>";
            echo "<li><strong>Teacher:</strong> teacher@test.com / password</li>";
            echo "<li><strong>Student:</strong> student@test.com / password</li>";
            echo "</ul>";
            
            echo "<h2>Next Steps:</h2>";
            echo "<ol>";
            echo "<li>Logout from your current account</li>";
            echo "<li>Open browser console (F12) and run: <code>localStorage.clear()</code></li>";
            echo "<li>Login with one of the test accounts above</li>";
            echo "<li>You should see the correct dashboard for that role!</li>";
            echo "</ol>";
            
        } else {
            echo "<p style='color:red'>✗ Users table does not exist</p>";
        }
    } else {
        echo "<p style='color:red'>✗ Failed to connect to database</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>✗ Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>
