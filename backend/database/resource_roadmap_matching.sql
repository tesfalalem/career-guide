-- Resource-Roadmap Automatic Matching System
-- This migration enhances the existing roadmap_resources table with auto-matching capabilities

-- Add auto_matched column to track automatically linked resources
ALTER TABLE roadmap_resources 
ADD COLUMN IF NOT EXISTS auto_matched BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS match_score DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP NULL;

-- Add index for better performance on auto-matching queries
CREATE INDEX IF NOT EXISTS idx_auto_matched ON roadmap_resources(auto_matched);

-- Create a view for easy access to matched resources
CREATE OR REPLACE VIEW resource_roadmap_matches AS
SELECT 
    rr.id,
    rr.roadmap_id,
    rr.resource_id,
    cr.title as roadmap_title,
    cr.category as roadmap_category,
    er.title as resource_title,
    er.category as resource_category,
    er.resource_type,
    er.status as resource_status,
    rr.auto_matched,
    rr.match_score,
    rr.phase_index,
    rr.topic_index,
    rr.display_order,
    rr.created_at
FROM roadmap_resources rr
JOIN curated_roadmaps cr ON rr.roadmap_id = cr.id
JOIN educational_resources er ON rr.resource_id = er.id
WHERE er.status = 'approved';

-- Create stored procedure for automatic resource matching
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS auto_match_resources(IN p_resource_id INT)
BEGIN
    DECLARE v_resource_category VARCHAR(100);
    DECLARE v_resource_tags JSON;
    
    -- Get resource details
    SELECT category, tags INTO v_resource_category, v_resource_tags
    FROM educational_resources
    WHERE id = p_resource_id AND status = 'approved';
    
    -- Match resources to roadmaps based on category
    INSERT INTO roadmap_resources (roadmap_id, resource_id, auto_matched, match_score, matched_at)
    SELECT 
        cr.id as roadmap_id,
        p_resource_id as resource_id,
        TRUE as auto_matched,
        1.00 as match_score,
        NOW() as matched_at
    FROM curated_roadmaps cr
    WHERE cr.category = v_resource_category
    AND cr.status = 'published'
    AND NOT EXISTS (
        SELECT 1 FROM roadmap_resources rr 
        WHERE rr.roadmap_id = cr.id 
        AND rr.resource_id = p_resource_id
    );
    
END //

DELIMITER ;

-- Create trigger to auto-match resources when approved
DELIMITER //

CREATE TRIGGER IF NOT EXISTS after_resource_approved
AFTER UPDATE ON educational_resources
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        CALL auto_match_resources(NEW.id);
    END IF;
END //

DELIMITER ;

-- Success message
SELECT 'Resource-Roadmap Matching System configured successfully!' as message;
