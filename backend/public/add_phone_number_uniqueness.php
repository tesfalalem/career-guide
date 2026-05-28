<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Migration: Add Phone Number Uniqueness</h1>\n";

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
    
    echo "✓ Database connected\n";
    
    // 1. Add phone_number column if not exists
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'phone_number'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE users ADD COLUMN phone_number VARCHAR(50) DEFAULT NULL AFTER email");
        echo "✓ Added phone_number column to users table\n";
    } else {
        echo "⚠ phone_number column already exists\n";
        // Make sure it is VARCHAR(50)
        $db->exec("ALTER TABLE users MODIFY COLUMN phone_number VARCHAR(50) DEFAULT NULL");
        echo "✓ Ensured phone_number is VARCHAR(50)\n";
    }
    
    // 2. Clean up duplicate or empty phone numbers for existing users before adding UNIQUE constraint
    // Convert empty or only-whitespace strings to NULL
    $stmt = $db->exec("UPDATE users SET phone_number = NULL WHERE TRIM(phone_number) = ''");
    echo "✓ Converted empty phone numbers to NULL (affected rows: $stmt)\n";
    
    // 3. Add UNIQUE index on phone_number
    $stmt = $db->query("SHOW INDEX FROM users WHERE Key_name = 'idx_unique_phone_number'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE users ADD UNIQUE INDEX idx_unique_phone_number (phone_number)");
        echo "✓ Added UNIQUE constraint on phone_number\n";
    } else {
        echo "⚠ UNIQUE index idx_unique_phone_number already exists\n";
    }
    
    echo "✓ MIGRATION COMPLETED SUCCESSFULLY!\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
