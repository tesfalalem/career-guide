<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Show columns
    $stmt = $db->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columns in 'users' table:\n";
    foreach ($columns as $col) {
        echo " - {$col['Field']} ({$col['Type']}) Null: {$col['Null']} Key: {$col['Key']} Default: {$col['Default']}\n";
    }
    
    // Show indexes
    $stmt = $db->query("SHOW INDEX FROM users");
    $indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nIndexes in 'users' table:\n";
    foreach ($indexes as $idx) {
        echo " - {$idx['Key_name']} -> Column: {$idx['Column_name']} Non_unique: {$idx['Non_unique']}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
