<?php
/**
 * Run this once to create the careers table.
 * Visit: http://localhost:8000/run-careers-migration.php
 */
require_once __DIR__ . '/../config/database.php';
$db = (new Database())->getConnection();
$results = [];

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS careers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(100) NOT NULL DEFAULT 'General',
            thumbnail_url VARCHAR(500) DEFAULT NULL,
            required_skills JSON DEFAULT NULL,
            status ENUM('draft','published') NOT NULL DEFAULT 'draft',
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $results[] = '✅ careers table created (or already exists)';
} catch (PDOException $e) {
    $results[] = '❌ ' . $e->getMessage();
}

try {
    $db->exec("CREATE INDEX IF NOT EXISTS idx_careers_status ON careers(status)");
    $results[] = '✅ idx_careers_status index ready';
} catch (PDOException $e) {
    $results[] = '⚠️ index: ' . $e->getMessage();
}

try {
    $db->exec("CREATE INDEX IF NOT EXISTS idx_careers_category ON careers(category)");
    $results[] = '✅ idx_careers_category index ready';
} catch (PDOException $e) {
    $results[] = '⚠️ index: ' . $e->getMessage();
}

// Verify
$count = $db->query("SELECT COUNT(*) FROM careers")->fetchColumn();
$results[] = "✅ careers table has $count rows";

header('Content-Type: text/plain');
echo implode("\n", $results) . "\n";
