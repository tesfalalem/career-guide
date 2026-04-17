-- Admin Content Management System Migration
-- Run this after the main schema.sql

-- 1. Update users table to add role column (if not exists)
ALTER TABLE users 
MODIFY COLUMN role ENUM('student', 'teacher', 'admin') DEFAULT 'student';

-- 2. Curated Roadmaps Table
CREATE TABLE IF NOT EXISTS curated_roadmaps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    estimated_duration VARCHAR(50),
    created_by INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    tags JSON,
    phases JSON NOT NULL,
    thumbnail_url VARCHAR(500),
    views INT DEFAULT 0,
    enrollments INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_difficulty (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Educational Resources Table
CREATE TABLE IF NOT EXISTS educational_resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type ENUM('document', 'video', 'link', 'book', 'article', 'course', 'tutorial') DEFAULT 'link',
    file_path VARCHAR(500),
    external_url VARCHAR(500),
    category VARCHAR(100),
    tags JSON,
    uploaded_by INT,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(50),
    downloads INT DEFAULT 0,
    views INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (resource_type),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Roadmap Resources Junction Table
CREATE TABLE IF NOT EXISTS roadmap_resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roadmap_id INT NOT NULL,
    resource_id INT NOT NULL,
    phase_index INT DEFAULT 0,
    topic_index INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roadmap_id) REFERENCES curated_roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES educational_resources(id) ON DELETE CASCADE,
    INDEX idx_roadmap (roadmap_id),
    INDEX idx_resource (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Curated Courses Table
CREATE TABLE IF NOT EXISTS curated_courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration VARCHAR(50),
    instructor_id INT,
    thumbnail_url VARCHAR(500),
    modules JSON NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    enrollments INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Roadmap Enrollments Table
CREATE TABLE IF NOT EXISTS roadmap_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    roadmap_id INT NOT NULL,
    progress INT DEFAULT 0,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roadmap_id) REFERENCES curated_roadmaps(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, roadmap_id),
    INDEX idx_user (user_id),
    INDEX idx_roadmap (roadmap_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Resource Bookmarks Table
CREATE TABLE IF NOT EXISTS resource_bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES educational_resources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, resource_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create uploads directory structure (run manually)
-- mkdir -p backend/uploads/resources/documents
-- mkdir -p backend/uploads/resources/videos
-- mkdir -p backend/uploads/resources/images

-- Success message
SELECT 'Admin Content Management tables created successfully!' as message;
