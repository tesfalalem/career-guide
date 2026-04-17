-- Add role approval workflow columns to users table

-- Add role_request column (what role the user is requesting)
ALTER TABLE users 
ADD COLUMN role_request ENUM('student', 'teacher', 'admin') DEFAULT 'student' AFTER role;

-- Add account_status column (pending, active, rejected)
ALTER TABLE users 
ADD COLUMN account_status ENUM('pending', 'active', 'rejected') DEFAULT 'active' AFTER role_request;

-- Add approval_notes column (admin can add notes when approving/rejecting)
ALTER TABLE users 
ADD COLUMN approval_notes TEXT NULL AFTER account_status;

-- Add requested_at timestamp (when the role was requested)
ALTER TABLE users 
ADD COLUMN requested_at TIMESTAMP NULL AFTER approval_notes;

-- Add approved_at timestamp (when the role was approved)
ALTER TABLE users 
ADD COLUMN approved_at TIMESTAMP NULL AFTER requested_at;

-- Add approved_by column (which admin approved the request)
ALTER TABLE users 
ADD COLUMN approved_by INT NULL AFTER approved_at,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Update existing users to have active status
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;

-- Create index for faster queries on pending approvals
CREATE INDEX idx_account_status ON users(account_status);
CREATE INDEX idx_role_request ON users(role_request);
