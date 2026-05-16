-- Teacher Materials Migration
-- Adds course_id, module_name, lesson_name to educational_resources
-- so teachers can organize materials by module/lesson

USE careerguide;

-- Add course-specific columns to educational_resources
ALTER TABLE educational_resources
  ADD COLUMN IF NOT EXISTS course_id INT NULL AFTER uploaded_by,
  ADD COLUMN IF NOT EXISTS module_name VARCHAR(255) NULL AFTER course_id,
  ADD COLUMN IF NOT EXISTS lesson_name VARCHAR(255) NULL AFTER module_name,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER lesson_name;

-- Add foreign key if not exists
ALTER TABLE educational_resources
  ADD CONSTRAINT fk_resource_course
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Index for fast course-based lookups
CREATE INDEX IF NOT EXISTS idx_course_id ON educational_resources(course_id);
