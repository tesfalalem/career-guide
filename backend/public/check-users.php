<?php
/**
 * Check existing users
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query("SELECT id, name, email, role FROM users ORDER BY role, id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Existing users in database:\n\n";
    
    foreach ($users as $user) {
        echo "ID: {$user['id']}\n";
        echo "Name: {$user['name']}\n";
        echo "Email: {$user['email']}\n";
        echo "Role: {$user['role']}\n";
        echo "---\n";
    }
    
    echo "\nTotal users: " . count($users) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
