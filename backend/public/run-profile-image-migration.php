<?php
/**
 * Run this once to ensure the profile_image column exists in the users table.
 * Visit: http://localhost:8000/run-profile-image-migration.php
 */
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

$results = [];

// 1. Add profile_image column if it doesn't exist
try {
    $db->exec("ALTER TABLE users ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL");
    $results[] = "✅ Added profile_image column (VARCHAR 500)";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        // Column exists — make sure it's wide enough
        try {
            $db->exec("ALTER TABLE users MODIFY COLUMN profile_image VARCHAR(500) DEFAULT NULL");
            $results[] = "✅ profile_image column already exists — widened to VARCHAR(500)";
        } catch (PDOException $e2) {
            $results[] = "⚠️ Could not modify column: " . $e2->getMessage();
        }
    } else {
        $results[] = "❌ Error: " . $e->getMessage();
    }
}

// 2. Verify column exists
try {
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'profile_image'");
    $col = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($col) {
        $results[] = "✅ Verified: profile_image column exists — Type: " . $col['Type'];
    } else {
        $results[] = "❌ Column still not found after migration!";
    }
} catch (PDOException $e) {
    $results[] = "❌ Verify error: " . $e->getMessage();
}

// 3. Show current profile_image values for all users
try {
    $stmt = $db->query("SELECT id, name, email, profile_image FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $results[] = "\n--- Current users ---";
    foreach ($users as $u) {
        $img = $u['profile_image'] ? substr($u['profile_image'], 0, 80) . '...' : 'NULL';
        $results[] = "  ID {$u['id']}: {$u['name']} ({$u['email']}) → {$img}";
    }
} catch (PDOException $e) {
    $results[] = "❌ Could not fetch users: " . $e->getMessage();
}

header('Content-Type: text/plain');
echo implode("\n", $results) . "\n";
