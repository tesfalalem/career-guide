<?php
/**
 * Create Teacher User - Quick Setup
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

echo "<h1>Create Teacher User</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; padding: 10px; background: #d4edda; margin: 10px 0; border-radius: 5px; }
    .error { color: red; padding: 10px; background: #f8d7da; margin: 10px 0; border-radius: 5px; }
    .info { color: blue; padding: 10px; background: #d1ecf1; margin: 10px 0; border-radius: 5px; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 5px; }
</style>";

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Check if teacher already exists
    $checkQuery = "SELECT * FROM users WHERE email = 'teacher@test.com'";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    $existing = $stmt->fetch();

    if ($existing) {
        echo "<div class='info'>Teacher user already exists!</div>";
        echo "<pre>" . json_encode($existing, JSON_PRETTY_PRINT) . "</pre>";
        
        // Update to ensure role is teacher
        $updateQuery = "UPDATE users SET role = 'teacher', account_status = 'active' WHERE email = 'teacher@test.com'";
        $conn->prepare($updateQuery)->execute();
        echo "<div class='success'>✓ Updated role to 'teacher' and status to 'active'</div>";
    } else {
        // Create new teacher user
        $insertQuery = "INSERT INTO users (name, email, password, role, account_status, created_at) 
                       VALUES (:name, :email, :password, :role, :status, NOW())";
        
        $stmt = $conn->prepare($insertQuery);
        $stmt->execute([
            'name' => 'Test Teacher',
            'email' => 'teacher@test.com',
            'password' => password_hash('teacher123', PASSWORD_BCRYPT),
            'role' => 'teacher',
            'status' => 'active'
        ]);
        
        echo "<div class='success'>✓ Teacher user created successfully!</div>";
    }

    // Fetch and display the user
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    $user = $stmt->fetch();

    echo "<h2>Teacher User Details</h2>";
    echo "<pre>" . json_encode($user, JSON_PRETTY_PRINT) . "</pre>";

    echo "<h2>Login Credentials</h2>";
    echo "<div class='info'>";
    echo "<strong>Email:</strong> teacher@test.com<br>";
    echo "<strong>Password:</strong> teacher123<br>";
    echo "<strong>Role:</strong> " . $user['role'] . "<br>";
    echo "</div>";

    echo "<h2>Next Steps</h2>";
    echo "<ol>";
    echo "<li>Go back to the test page: <a href='/test-resource-upload.html'>test-resource-upload.html</a></li>";
    echo "<li>Click the 'Login' button</li>";
    echo "<li>Try uploading a resource</li>";
    echo "</ol>";

} catch (Exception $e) {
    echo "<div class='error'>Error: " . $e->getMessage() . "</div>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>
