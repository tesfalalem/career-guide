<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$conn = $db->getConnection();

try {
    // Add columns if they don't exist
    $cols = [
        "ALTER TABLE educational_resources ADD COLUMN IF NOT EXISTS course_id INT NULL AFTER uploaded_by",
        "ALTER TABLE educational_resources ADD COLUMN IF NOT EXISTS module_name VARCHAR(255) NULL AFTER course_id",
        "ALTER TABLE educational_resources ADD COLUMN IF NOT EXISTS lesson_name VARCHAR(255) NULL AFTER module_name",
        "ALTER TABLE educational_resources ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER lesson_name",
    ];
    foreach ($cols as $sql) {
        try { $conn->exec($sql); echo "OK: $sql<br>"; }
        catch (Exception $e) { echo "SKIP: " . $e->getMessage() . "<br>"; }
    }

    // Add index
    try {
        $conn->exec("CREATE INDEX idx_course_id ON educational_resources(course_id)");
        echo "Index created<br>";
    } catch (Exception $e) { echo "Index skip: " . $e->getMessage() . "<br>"; }

    echo "<br><strong>Migration complete!</strong>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
