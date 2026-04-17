-- ============================================================
-- RUN THIS ONCE IN phpMyAdmin to enable all features
-- Select the 'careerguide' database first, then run this SQL
-- ============================================================

USE careerguide;

-- 1. Role approval columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_request ENUM('student','teacher','admin','bit') DEFAULT 'student' AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status ENUM('pending','active','rejected') DEFAULT 'active' AFTER role_request;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_notes TEXT NULL AFTER account_status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP NULL AFTER approval_notes;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER requested_at;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INT NULL AFTER approved_at;

-- 2. Teacher profile columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience INT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise_areas JSON NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualifications JSON NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed TINYINT(1) DEFAULT 0;

-- 3. Update role ENUM to include 'teacher' and 'bit'
ALTER TABLE users MODIFY COLUMN role ENUM('student','teacher','admin','bit') DEFAULT 'student';

-- 4. Set all existing users to active
UPDATE users SET account_status = 'active' WHERE account_status IS NULL OR account_status = '';

-- 5. Assessments tables
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit INT DEFAULT 30,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assessment_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    question TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer INT NOT NULL,
    explanation TEXT,
    order_index INT DEFAULT 0,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assessment_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    answers JSON,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. BiT user (password: bit123)
INSERT INTO users (name, email, password, role, account_status, xp, streak)
VALUES ('BiT Admin','bit@bit.bdu.edu.et','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','bit','active',0,0)
ON DUPLICATE KEY UPDATE role='bit', account_status='active';

-- 7. Course Assignment System
CREATE TABLE IF NOT EXISTS teacher_course_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    UNIQUE KEY unique_assignment (teacher_id, course_id),
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_course (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users ADD COLUMN IF NOT EXISTS course_selected TINYINT(1) DEFAULT 0;

SELECT 'All migrations completed successfully!' AS result;
SELECT id, name, email, role, account_status FROM users ORDER BY id;
