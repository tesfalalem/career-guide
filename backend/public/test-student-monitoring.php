<?php
// Test Student Monitoring System

require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/plain');

echo "=== Student Monitoring System Test ===\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // 1. Check if tables exist
    echo "1. Checking database tables...\n";
    $tables = [
        'resource_access_logs',
        'student_resource_progress',
        'feedback_messages',
        'student_engagement_metrics'
    ];
    
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "   ✓ Table '$table' exists\n";
        } else {
            echo "   ✗ Table '$table' NOT FOUND (run migration)\n";
        }
    }
    
    // 2. Check view
    echo "\n2. Checking view...\n";
    $stmt = $db->query("SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_careerguide = 'teacher_student_overview'");
    if ($stmt->rowCount() > 0) {
        echo "   ✓ View 'teacher_student_overview' exists\n";
    } else {
        echo "   ✗ View NOT FOUND (run migration)\n";
    }
    
    // 3. Check stored procedure
    echo "\n3. Checking stored procedure...\n";
    $stmt = $db->query("SHOW PROCEDURE STATUS WHERE Name = 'update_student_engagement'");
    if ($stmt->rowCount() > 0) {
        echo "   ✓ Stored procedure 'update_student_engagement' exists\n";
    } else {
        echo "   ✗ Stored procedure NOT FOUND (run migration)\n";
    }
    
    // 4. Check triggers
    echo "\n4. Checking triggers...\n";
    $stmt = $db->query("SHOW TRIGGERS LIKE 'student_resource_progress'");
    if ($stmt->rowCount() > 0) {
        echo "   ✓ Trigger 'after_progress_update' exists\n";
    } else {
        echo "   ✗ Trigger NOT FOUND (run migration)\n";
    }
    
    // 5. Show current data
    echo "\n5. Current data summary...\n";
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM resource_access_logs");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "   Access Logs: $count entries\n";
    } catch (PDOException $e) {
        echo "   Access Logs: Table not found\n";
    }
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM student_resource_progress");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "   Progress Records: $count entries\n";
    } catch (PDOException $e) {
        echo "   Progress Records: Table not found\n";
    }
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM feedback_messages");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "   Feedback Messages: $count entries\n";
    } catch (PDOException $e) {
        echo "   Feedback Messages: Table not found\n";
    }
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM student_engagement_metrics");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "   Engagement Metrics: $count entries\n";
    } catch (PDOException $e) {
        echo "   Engagement Metrics: Table not found\n";
    }
    
    // 6. Test API endpoints
    echo "\n6. Available API endpoints...\n";
    echo "   Teacher Endpoints:\n";
    echo "   - GET /api/teacher/students (get all students)\n";
    echo "   - GET /api/teacher/students/{id}/progress (detailed progress)\n";
    echo "   - POST /api/teacher/feedback (send feedback)\n";
    echo "   - GET /api/teacher/feedback/{studentId} (feedback history)\n";
    echo "   - GET /api/feedback/unread (unread count)\n";
    echo "\n   Student Endpoints:\n";
    echo "   - POST /api/student/track-access (track resource access)\n";
    echo "   - POST /api/student/rate-resource (rate a resource)\n";
    
    // 7. Sample data for testing
    echo "\n7. Sample test data...\n";
    
    // Get a teacher
    $stmt = $db->query("SELECT id, name FROM users WHERE role = 'teacher' LIMIT 1");
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($teacher) {
        echo "   Sample Teacher: {$teacher['name']} (ID: {$teacher['id']})\n";
        
        // Get teacher's resources
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM educational_resources WHERE uploaded_by = ?");
        $stmt->execute([$teacher['id']]);
        $resourceCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "   Teacher's Resources: $resourceCount\n";
    } else {
        echo "   No teachers found\n";
    }
    
    // Get a student
    $stmt = $db->query("SELECT id, name FROM users WHERE role = 'student' LIMIT 1");
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($student) {
        echo "   Sample Student: {$student['name']} (ID: {$student['id']})\n";
    } else {
        echo "   No students found\n";
    }
    
    echo "\n✅ Test completed!\n";
    echo "\nNext steps:\n";
    echo "1. Run migration: php run-student-monitoring-migration.php\n";
    echo "2. Students access resources → progress tracked automatically\n";
    echo "3. Teachers view student progress in dashboard\n";
    echo "4. Bidirectional feedback between teachers and students\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}
