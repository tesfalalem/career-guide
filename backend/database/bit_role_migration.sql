-- BiT Role Migration
-- Run this in phpMyAdmin on the careerguide database

-- 1. Add 'bit' and 'teacher' to the role ENUM if not already present
ALTER TABLE users 
MODIFY COLUMN role ENUM('student', 'teacher', 'admin', 'bit') DEFAULT 'student';

-- 2. Create default BiT admin user (password: bit123)
INSERT INTO users (name, email, password, role, account_status, xp, streak)
VALUES (
    'BiT Admin',
    'bit@bit.bdu.edu.et',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'bit',
    'active',
    0,
    0
)
ON DUPLICATE KEY UPDATE role = 'bit', account_status = 'active';

SELECT 'BiT migration completed successfully!' as message;
SELECT id, name, email, role FROM users WHERE role = 'bit';
