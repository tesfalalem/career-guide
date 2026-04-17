<?php
/**
 * Seed sample data for analytics testing
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Seeding analytics data...\n\n";
    
    // Get a teacher
    $stmt = $db->query("SELECT id, name FROM users WHERE role = 'teacher' LIMIT 1");
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$teacher) {
        echo "✗ No teacher found. Please create a teacher user first.\n";
        exit(1);
    }
    
    echo "Using teacher: {$teacher['name']} (ID: {$teacher['id']})\n\n";
    
    // Get some students
    $stmt = $db->query("SELECT id, name FROM users WHERE role = 'student' LIMIT 5");
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($students) == 0) {
        echo "✗ No students found. Please create student users first.\n";
        exit(1);
    }
    
    echo "Found " . count($students) . " students\n\n";
    
    // Create engagement metrics for each student
    foreach ($students as $student) {
        $stmt = $db->prepare("
            INSERT INTO student_engagement_metrics 
            (user_id, teacher_id, total_resources_accessed, total_resources_completed, 
             total_time_spent, average_rating, engagement_score, risk_level, last_activity_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                total_resources_accessed = VALUES(total_resources_accessed),
                total_resources_completed = VALUES(total_resources_completed),
                total_time_spent = VALUES(total_time_spent),
                average_rating = VALUES(average_rating),
                engagement_score = VALUES(engagement_score),
                risk_level = VALUES(risk_level),
                last_activity_at = VALUES(last_activity_at)
        ");
        
        $accessed = rand(5, 20);
        $completed = rand(2, $accessed);
        $timeSpent = rand(3600, 36000); // 1-10 hours
        $rating = rand(30, 50) / 10; // 3.0-5.0
        $engagement = rand(40, 95);
        $risk = $engagement >= 70 ? 'low' : ($engagement >= 40 ? 'medium' : 'high');
        
        $stmt->execute([
            $student['id'],
            $teacher['id'],
            $accessed,
            $completed,
            $timeSpent,
            $rating,
            $engagement,
            $risk
        ]);
        
        echo "✓ Created engagement metrics for {$student['name']}\n";
        echo "  - Resources accessed: $accessed\n";
        echo "  - Resources completed: $completed\n";
        echo "  - Engagement score: $engagement\n";
        echo "  - Risk level: $risk\n\n";
    }
    
    echo "✓ Analytics data seeded successfully!\n";
    echo "\nYou can now view analytics in the teacher portal.\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
