-- Course Assignment System Migration
-- Run in phpMyAdmin on the careerguide database

USE careerguide;

-- Teacher course assignments (teacher registers for a BiT course)
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
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student-teacher class links (student enrolled in a course under a specific teacher)
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

-- Track if teacher has completed first-login course selection
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_selected TINYINT(1) DEFAULT 0;

SELECT 'Course system migration completed!' AS result;
