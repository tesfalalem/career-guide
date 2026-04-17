<?php
/**
 * Test Notifications System
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Controllers/NotificationController.php';

try {
    echo "Testing notifications system...\n\n";
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Could not connect to database");
    }
    
    // Get a test user (first user in database)
    $stmt = $db->query("SELECT id, name, email, role FROM users LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "✗ No users found in database. Please create a user first.\n";
        exit(1);
    }
    
    echo "Creating test notifications for user: {$user['name']} (ID: {$user['id']})\n\n";
    
    // Create NotificationController instance
    $notificationController = new App\Controllers\NotificationController($db);
    
    // Create sample notifications
    $notifications = [
        [
            'type' => 'success',
            'title' => 'Welcome to CareerGuide!',
            'message' => 'Your account has been successfully created. Start exploring career paths today!',
            'link' => null
        ],
        [
            'type' => 'info',
            'title' => 'New Resource Available',
            'message' => 'A new learning resource "Introduction to Web Development" has been added to your roadmap.',
            'link' => '/resources/123'
        ],
        [
            'type' => 'warning',
            'title' => 'Complete Your Profile',
            'message' => 'Your profile is 60% complete. Add more information to get better recommendations.',
            'link' => '/profile'
        ],
        [
            'type' => 'success',
            'title' => 'Achievement Unlocked!',
            'message' => 'Congratulations! You\'ve completed 5 courses this month.',
            'link' => '/progress'
        ],
        [
            'type' => 'info',
            'title' => 'Teacher Feedback',
            'message' => 'Your teacher has provided feedback on your recent assignment.',
            'link' => '/feedback'
        ]
    ];
    
    foreach ($notifications as $notification) {
        $result = $notificationController->createNotification(
            $user['id'],
            $notification['type'],
            $notification['title'],
            $notification['message'],
            $notification['link']
        );
        
        if ($result['success']) {
            echo "✓ Created notification: {$notification['title']}\n";
        } else {
            echo "✗ Failed to create notification: {$notification['title']}\n";
        }
    }
    
    echo "\n✓ Test notifications created successfully!\n";
    echo "\nYou can now test the notification bell in the frontend.\n";
    
} catch (Exception $e) {
    echo "✗ Test failed: " . $e->getMessage() . "\n";
    exit(1);
}
