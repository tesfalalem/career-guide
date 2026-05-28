<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "==================================================\n";
echo "RUNNING SECURE AUTHENTICATION AND PASSWORD RESET TESTS\n";
echo "==================================================\n\n";

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

// Check database connection first
try {
    $database = new Database();
    $db = $database->getConnection();
    echo "✓ Database connection established successfully.\n\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Clean up existing test users first
$db->exec("DELETE FROM users WHERE email IN ('teststudent@gmail.com', 'testteacher@gmail.com', 'testadmin@gmail.com')");

// Start PHP local server in background
$host = 'localhost';
$port = 8001;
$serverCmd = "C:\\xampp\\php\\php.exe -S $host:$port -t \"" . __DIR__ . "\"";

echo "Starting local server on $host:$port...\n";
$resource = popen("start /B " . $serverCmd, "r");
sleep(2); // Wait for server to start

function sendPost($url, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

$baseUrl = "http://$host:$port/index.php/api";

$tests = [];

// Test Case 1: Student Signup with Phone Number
echo "Test 1: Student Signup with phone number...\n";
$studentData = [
    'name' => 'John Doe Student',
    'email' => 'teststudent@gmail.com',
    'phone_number' => '+251911223344',
    'password' => 'SecurePass123!',
    'role_preference' => 'student',
    'student_id' => 'BIT/100/12',
    'department' => 'Software Engineering',
    'academic_year' => '4th Year',
    'graduation_year' => 2026
];
$res = sendPost("$baseUrl/auth/register", $studentData);
if ($res['code'] === 201 && isset($res['body']['user'])) {
    echo "✓ Student registration successful.\n";
    $tests['student_signup'] = true;
} else {
    echo "✗ Student registration failed: " . json_encode($res) . "\n";
    $tests['student_signup'] = false;
}

// Test Case 2: Teacher Signup with Phone Number
echo "\nTest 2: Teacher Signup with phone number...\n";
$teacherData = [
    'name' => 'Jane Smith Teacher',
    'email' => 'testteacher@gmail.com',
    'phone_number' => '+251922334455',
    'password' => 'SecurePass123!',
    'role_preference' => 'teacher',
    'institution' => 'Bahir Dar University',
    'years_experience' => 8,
    'bio' => 'Experienced lecturer.'
];
$res = sendPost("$baseUrl/auth/register", $teacherData);
if ($res['code'] === 201 && isset($res['body']['user'])) {
    echo "✓ Teacher registration successful (pending approval).\n";
    $tests['teacher_signup'] = true;
} else {
    echo "✗ Teacher registration failed: " . json_encode($res) . "\n";
    $tests['teacher_signup'] = false;
}

// Test Case 3: Duplicate Email Check
echo "\nTest 3: Enforcing email uniqueness...\n";
$duplicateEmailData = $studentData;
$duplicateEmailData['phone_number'] = '+251933445566'; // different phone
$res = sendPost("$baseUrl/auth/register", $duplicateEmailData);
if ($res['code'] === 409) {
    echo "✓ Correctly rejected duplicate email.\n";
    $tests['duplicate_email'] = true;
} else {
    echo "✗ Failed to reject duplicate email: " . json_encode($res) . "\n";
    $tests['duplicate_email'] = false;
}

// Test Case 4: Duplicate Phone Number Check
echo "\nTest 4: Enforcing phone number uniqueness...\n";
$duplicatePhoneData = $studentData;
$duplicatePhoneData['email'] = 'newemail@gmail.com'; // different email
$res = sendPost("$baseUrl/auth/register", $duplicatePhoneData);
if ($res['code'] === 409) {
    echo "✓ Correctly rejected duplicate phone number.\n";
    $tests['duplicate_phone'] = true;
} else {
    echo "✗ Failed to reject duplicate phone number: " . json_encode($res) . "\n";
    $tests['duplicate_phone'] = false;
}

// Test Case 5: Phone Number Format Validation (Invalid formats)
echo "\nTest 5: Validating phone number formats...\n";
$invalidPhoneData = $studentData;
$invalidPhoneData['email'] = 'anothernew@gmail.com';
$invalidPhoneData['phone_number'] = '123-abc-456'; // letters in phone
$res1 = sendPost("$baseUrl/auth/register", $invalidPhoneData);

$invalidPhoneData['phone_number'] = '12345'; // too short
$res2 = sendPost("$baseUrl/auth/register", $invalidPhoneData);

if ($res1['code'] === 400 && $res2['code'] === 400) {
    echo "✓ Correctly rejected invalid phone formats.\n";
    $tests['phone_validation'] = true;
} else {
    echo "✗ Failed to reject invalid phone formats: " . json_encode([$res1, $res2]) . "\n";
    $tests['phone_validation'] = false;
}

// Test Case 6: Forgot Password - Correct Identity Verification (Student)
echo "\nTest 6: Secure Forgot Password reset (Correct combination)...\n";
$resetData = [
    'name' => 'John Doe Student',
    'email' => 'teststudent@gmail.com',
    'phone_number' => '+251911223344',
    'password' => 'NewSecurePass123!',
    'confirm_password' => 'NewSecurePass123!'
];
$res = sendPost("$baseUrl/auth/forgot-password", $resetData);
if ($res['code'] === 200) {
    echo "✓ Forgot Password reset successful.\n";
    $tests['forgot_password_success'] = true;
} else {
    echo "✗ Forgot Password reset failed: " . json_encode($res) . "\n";
    $tests['forgot_password_success'] = false;
}

// Test Case 7: Forgot Password - Wrong Identity (Incorrect name)
echo "\nTest 7: Forgot Password rejection (Wrong name)...\n";
$wrongNameReset = $resetData;
$wrongNameReset['name'] = 'Incorrect Name';
$res = sendPost("$baseUrl/auth/forgot-password", $wrongNameReset);
if ($res['code'] === 400) {
    echo "✓ Correctly rejected wrong name.\n";
    $tests['forgot_password_wrong_name'] = true;
} else {
    echo "✗ Failed to reject wrong name: " . json_encode($res) . "\n";
    $tests['forgot_password_wrong_name'] = false;
}

// Test Case 8: Forgot Password - Wrong Identity (Wrong phone)
echo "\nTest 8: Forgot Password rejection (Wrong phone)...\n";
$wrongPhoneReset = $resetData;
$wrongPhoneReset['phone_number'] = '+251999999999';
$res = sendPost("$baseUrl/auth/forgot-password", $wrongPhoneReset);
if ($res['code'] === 400) {
    echo "✓ Correctly rejected wrong phone.\n";
    $tests['forgot_password_wrong_phone'] = true;
} else {
    echo "✗ Failed to reject wrong phone: " . json_encode($res) . "\n";
    $tests['forgot_password_wrong_phone'] = false;
}

// Test Case 9: Forgot Password - Role Restriction (Trying to reset Admin)
echo "\nTest 9: Forgot Password role restriction (Admin check)...\n";
$adminData = [
    'name' => 'Admin User Test',
    'email' => 'testadmin@gmail.com',
    'password' => password_hash('password', PASSWORD_BCRYPT),
    'role' => 'admin',
    'phone_number' => '+251977777777'
];
$db->exec("INSERT INTO users (name, email, password, role, phone_number) VALUES ('Admin User Test', 'testadmin@gmail.com', 'hashed', 'admin', '+251977777777')");

$adminReset = [
    'name' => 'Admin User Test',
    'email' => 'testadmin@gmail.com',
    'phone_number' => '+251977777777',
    'password' => 'NewSecurePass123!',
    'confirm_password' => 'NewSecurePass123!'
];
$res = sendPost("$baseUrl/auth/forgot-password", $adminReset);
if ($res['code'] === 403) {
    echo "✓ Correctly rejected forgot password request for admin role.\n";
    $tests['forgot_password_admin_block'] = true;
} else {
    echo "✗ Failed to block forgot password for admin: " . json_encode($res) . "\n";
    $tests['forgot_password_admin_block'] = false;
}

// Test Case 10: Forgot Password - Weak Password Rejection
echo "\nTest 10: Forgot Password password strength validation...\n";
$weakReset = $resetData;
$weakReset['password'] = '12345678';
$weakReset['confirm_password'] = '12345678';
$res = sendPost("$baseUrl/auth/forgot-password", $weakReset);
if ($res['code'] === 400 && strpos($res['body']['error'] ?? '', 'letters and numbers') !== false) {
    echo "✓ Correctly rejected weak/short password.\n";
    $tests['forgot_password_weak_pass'] = true;
} else {
    echo "✗ Failed to reject weak password: " . json_encode($res) . "\n";
    $tests['forgot_password_weak_pass'] = false;
}

// Clean up test users
$db->exec("DELETE FROM users WHERE email IN ('teststudent@gmail.com', 'testteacher@gmail.com', 'testadmin@gmail.com')");

pclose($resource);

// Find and kill the process on port 8001
$netstat = shell_exec('netstat -ano | findstr 8001');
if ($netstat) {
    preg_match('/LISTENING\s+(\d+)/', $netstat, $matches);
    $pid = $matches[1] ?? null;
    if ($pid) {
        shell_exec("taskkill /F /PID $pid");
    }
}

echo "\n==================================================\n";
echo "TEST RESULTS SUMMARY:\n";
echo "==================================================\n";
$allPassed = true;
foreach ($tests as $test => $passed) {
    $status = $passed ? "PASS" : "FAIL";
    $color = $passed ? "[PASS]" : "[FAIL]";
    echo "$color $test\n";
    if (!$passed) $allPassed = false;
}

if ($allPassed) {
    echo "\n🎉 ALL TESTS PASSED SUCCESSFULLY!\n";
    exit(0);
} else {
    echo "\n❌ SOME TESTS FAILED.\n";
    exit(1);
}
