-- Enhanced Teacher Profile Fields
-- Add additional fields for comprehensive teacher profiles

ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS teaching_philosophy TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications JSON DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages_spoken JSON DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_availability ON users(availability_status);
CREATE INDEX IF NOT EXISTS idx_years_experience ON users(years_experience);

-- Success message
SELECT 'Enhanced teacher profile fields added successfully!' as message;
