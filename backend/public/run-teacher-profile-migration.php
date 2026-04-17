<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Read the migration file
    $migrationSQL = file_get_contents(__DIR__ . '/../database/teacher_profile_settings_migration.sql');
    
    // Split into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $migrationSQL)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );
    
    $db->beginTransaction();
    
    $results = [];
    foreach ($statements as $statement) {
        try {
            $db->exec($statement);
            $results[] = [
                'success' => true,
                'statement' => substr($statement, 0, 100) . '...'
            ];
        } catch (PDOException $e) {
            $results[] = [
                'success' => false,
                'statement' => substr($statement, 0, 100) . '...',
                'error' => $e->getMessage()
            ];
        }
    }
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Teacher profile and settings migration completed',
        'results' => $results
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
