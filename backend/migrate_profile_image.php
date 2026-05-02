<?php
require_once __DIR__ . '/config/database.php';
$db = (new Database())->getConnection();
try {
    $db->exec("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL AFTER email");
    echo "Migration successful\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Column already exists\n";
    } else {
        echo "Migration failed: " . $e->getMessage() . "\n";
    }
}
