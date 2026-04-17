<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Test Teacher Signup Flow</h1>";

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
require_once __DIR__ . '/../app/Models/User.php';

try {
    $userModel = new User();
    
    // Test data for teacher signup
    $testEmail = 'testteacher' . time() . '@test.com';
    
    $userData = [
        'name' => 'Test Teacher',
        'email' => $testEmail,
        'password' => password_hash('password', PASSWORD_BCRYPT),
        'role' => 'student',
        'role_request' => 'teacher',
        'account_status' => 'pending',
        'requested_at' => date('Y-m-d H:i:s'),
        'institution' => 'Test University',
        'years_experience' => 5,
        'expertise_areas' => json_encode(['Frontend', 'Backend']),
        'bio' => 'Test teacher bio',
        'profile_completed' => true
    ];
    
    echo "<h2>Creating Test Teacher Account...</h2>";
    echo "<pre>";
    print_r($userData);
    echo "</pre>";
    
    $userId = $userModel->create($userData);
    
    if ($userId) {
        echo "<p style='color:green; font-size:18px;'>✓ User created with ID: $userId</p>";
        
        // Fetch the created user
        $user = $userModel->findById($userId);
        
        echo "<h2>Created User Data:</h2>";
        echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
        echo "<tr><th>Field</th><th>Value</th></tr>";
        foreach ($user as $key => $value) {
            if ($key === 'password') continue;
            $displayValue = $value ?? '<em>NULL</em>';
            $color = '';
            if ($key === 'role') $color = $value === 'student' ? 'color:green' : 'color:red';
            if ($key === 'role_request') $color = $value === 'teacher' ? 'color:blue; font-weight:bold' : '';
            if ($key === 'account_status') $color = $value === 'pending' ? 'color:orange; font-weight:bold' : '';
            echo "<tr><td><strong>$key</strong></td><td style='$color'>$displayValue</td></tr>";
        }
        echo "</table>";
        
        // Verify the key fields
        echo "<h2>Verification:</h2>";
        $checks = [
            'role' => ['expected' => 'student', 'actual' => $user['role']],
            'role_request' => ['expected' => 'teacher', 'actual' => $user['role_request']],
            'account_status' => ['expected' => 'pending', 'actual' => $user['account_status']]
        ];
        
        $allGood = true;
        foreach ($checks as $field => $check) {
            $match = $check['actual'] === $check['expected'];
            if (!$match) $allGood = false;
            $icon = $match ? '✓' : '✗';
            $color = $match ? 'green' : 'red';
            echo "<p style='color:$color; font-size:16px;'>$icon <strong>$field:</strong> Expected '{$check['expected']}', Got '{$check['actual']}'</p>";
        }
        
        if ($allGood) {
            echo "<div style='background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;'>";
            echo "<h2 style='color: #2e7d32;'>✓ SUCCESS!</h2>";
            echo "<p>Teacher signup is working correctly!</p>";
            echo "<p><strong>Test Credentials:</strong> $testEmail / password</p>";
            echo "<p>This user should:</p>";
            echo "<ul>";
            echo "<li>See student dashboard when logged in (because pending)</li>";
            echo "<li>Appear in admin 'Pending Approvals' tab</li>";
            echo "<li>See teacher dashboard after admin approval</li>";
            echo "</ul>";
            echo "</div>";
        } else {
            echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
            echo "<h2 style='color: #c62828;'>⚠ Issue Found</h2>";
            echo "<p>The user was created but some fields don't match expected values.</p>";
            echo "</div>";
        }
        
    } else {
        echo "<p style='color:red; font-size:18px;'>✗ Failed to create user</p>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336;'>";
    echo "<h2>Error:</h2>";
    echo "<p style='color:red'>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";
}
?>
