-- Add teacher profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_preference VARCHAR(20) DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise_areas JSON DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualifications JSON DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add student-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INT DEFAULT NULL;

-- Update existing users to have profile_completed = true if they have basic info
UPDATE users SET profile_completed = TRUE WHERE name IS NOT NULL AND email IS NOT NULL;
