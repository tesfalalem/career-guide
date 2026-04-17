-- Student Monitoring System
-- Tracks student engagement with teacher resources and enables bidirectional feedback

-- 1. Resource Access Tracking
CREATE TABLE IF NOT EXISTS resource_access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    access_type ENUM('view', 'download', 'complete') DEFAULT 'view',
    time_spent INT DEFAULT 0, -- in seconds
    progress_percentage INT DEFAULT 0,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES educational_resources(id) ON DELETE CASCADE,
    INDEX idx_user_resource (user_id, resource_id),
    INDEX idx_accessed_at (accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Progress Tracking
CREATE TABLE IF NOT EXISTS student_resource_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'paused') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    time_spent_total INT DEFAULT 0, -- total seconds spent
    last_accessed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    rating INT DEFAULT NULL, -- 1-5 stars
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES educational_resources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_resource (user_id, resource_id),
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_resource (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bidirectional Feedback System
CREATE TABLE IF NOT EXISTS feedback_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    resource_id INT NULL, -- optional: feedback about specific resource
    roadmap_id INT NULL, -- optional: feedback about roadmap progress
    feedback_type ENUM('teacher_to_student', 'student_to_teacher', 'general') DEFAULT 'general',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    rating INT DEFAULT NULL, -- 1-5 stars (for student feedback)
    is_read BOOLEAN DEFAULT FALSE,
    parent_feedback_id INT NULL, -- for threaded conversations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES educational_resources(id) ON DELETE SET NULL,
    FOREIGN KEY (roadmap_id) REFERENCES curated_roadmaps(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_feedback_id) REFERENCES feedback_messages(id) ON DELETE CASCADE,
    INDEX idx_to_user (to_user_id, is_read),
    INDEX idx_from_user (from_user_id),
    INDEX idx_resource (resource_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Student Engagement Metrics (aggregated data)
CREATE TABLE IF NOT EXISTS student_engagement_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    teacher_id INT NOT NULL,
    total_resources_accessed INT DEFAULT 0,
    total_resources_completed INT DEFAULT 0,
    total_time_spent INT DEFAULT 0, -- in seconds
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    last_activity_at TIMESTAMP NULL,
    engagement_score INT DEFAULT 0, -- 0-100 calculated score
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_teacher (user_id, teacher_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_engagement (engagement_score),
    INDEX idx_risk (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create view for easy teacher monitoring
CREATE OR REPLACE VIEW teacher_student_overview AS
SELECT 
    sem.user_id as student_id,
    u.name as student_name,
    u.email as student_email,
    sem.teacher_id,
    sem.total_resources_accessed,
    sem.total_resources_completed,
    sem.total_time_spent,
    sem.average_rating,
    sem.last_activity_at,
    sem.engagement_score,
    sem.risk_level,
    COUNT(DISTINCT srp.resource_id) as active_resources,
    COUNT(DISTINCT fm.id) as unread_feedback_count
FROM student_engagement_metrics sem
JOIN users u ON sem.user_id = u.id
LEFT JOIN student_resource_progress srp ON sem.user_id = srp.user_id AND srp.status = 'in_progress'
LEFT JOIN feedback_messages fm ON sem.user_id = fm.from_user_id AND fm.to_user_id = sem.teacher_id AND fm.is_read = FALSE
GROUP BY sem.user_id, sem.teacher_id;

-- 6. Stored procedure to update engagement metrics
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS update_student_engagement(IN p_user_id INT, IN p_teacher_id INT)
BEGIN
    DECLARE v_total_accessed INT;
    DECLARE v_total_completed INT;
    DECLARE v_total_time INT;
    DECLARE v_avg_rating DECIMAL(3,2);
    DECLARE v_last_activity TIMESTAMP;
    DECLARE v_engagement_score INT;
    DECLARE v_risk_level VARCHAR(10);
    
    -- Calculate metrics
    SELECT 
        COUNT(DISTINCT srp.resource_id),
        SUM(CASE WHEN srp.status = 'completed' THEN 1 ELSE 0 END),
        SUM(srp.time_spent_total),
        AVG(srp.rating),
        MAX(srp.last_accessed_at)
    INTO 
        v_total_accessed,
        v_total_completed,
        v_total_time,
        v_avg_rating,
        v_last_activity
    FROM student_resource_progress srp
    JOIN educational_resources er ON srp.resource_id = er.id
    WHERE srp.user_id = p_user_id 
    AND er.uploaded_by = p_teacher_id;
    
    -- Calculate engagement score (0-100)
    SET v_engagement_score = LEAST(100, 
        (v_total_accessed * 5) + 
        (v_total_completed * 15) + 
        (COALESCE(v_avg_rating, 0) * 10) +
        (CASE 
            WHEN DATEDIFF(NOW(), v_last_activity) <= 7 THEN 20
            WHEN DATEDIFF(NOW(), v_last_activity) <= 14 THEN 10
            ELSE 0
        END)
    );
    
    -- Determine risk level
    SET v_risk_level = CASE
        WHEN v_engagement_score >= 70 THEN 'low'
        WHEN v_engagement_score >= 40 THEN 'medium'
        ELSE 'high'
    END;
    
    -- Insert or update metrics
    INSERT INTO student_engagement_metrics (
        user_id, teacher_id, total_resources_accessed, total_resources_completed,
        total_time_spent, average_rating, last_activity_at, engagement_score, risk_level
    ) VALUES (
        p_user_id, p_teacher_id, v_total_accessed, v_total_completed,
        v_total_time, v_avg_rating, v_last_activity, v_engagement_score, v_risk_level
    )
    ON DUPLICATE KEY UPDATE
        total_resources_accessed = v_total_accessed,
        total_resources_completed = v_total_completed,
        total_time_spent = v_total_time,
        average_rating = v_avg_rating,
        last_activity_at = v_last_activity,
        engagement_score = v_engagement_score,
        risk_level = v_risk_level;
END //

DELIMITER ;

-- 7. Trigger to update engagement metrics when progress changes
DELIMITER //

CREATE TRIGGER IF NOT EXISTS after_progress_update
AFTER UPDATE ON student_resource_progress
FOR EACH ROW
BEGIN
    DECLARE v_teacher_id INT;
    
    -- Get teacher who uploaded the resource
    SELECT uploaded_by INTO v_teacher_id
    FROM educational_resources
    WHERE id = NEW.resource_id;
    
    IF v_teacher_id IS NOT NULL THEN
        CALL update_student_engagement(NEW.user_id, v_teacher_id);
    END IF;
END //

DELIMITER ;

-- Success message
SELECT 'Student Monitoring System created successfully!' as message;
