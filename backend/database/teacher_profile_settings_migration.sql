-- Teacher Profile and Settings Migration
-- This migration adds profile fields and creates settings table

-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS teaching_philosophy TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS qualifications JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS certifications JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS expertise_areas JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS languages JSON DEFAULT NULL;

-- Create teacher settings table
CREATE TABLE IF NOT EXISTS teacher_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    resource_approval_alerts BOOLEAN DEFAULT TRUE,
    student_feedback_alerts BOOLEAN DEFAULT TRUE,
    weekly_report BOOLEAN DEFAULT TRUE,
    privacy_show_email BOOLEAN DEFAULT FALSE,
    privacy_show_phone BOOLEAN DEFAULT FALSE,
    privacy_public_profile BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Create index for faster queries
CREATE INDEX idx_teacher_settings_user ON teacher_settings(user_id);

-- Insert default settings for existing teachers
INSERT IGNORE INTO teacher_settings (user_id)
SELECT id FROM users WHERE role = 'teacher';
