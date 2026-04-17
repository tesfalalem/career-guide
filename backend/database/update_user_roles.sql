-- Update User Roles Script
-- Use this to change existing users to different roles

-- Example: Make a specific user an admin (replace with actual email)
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Example: Make a specific user a teacher (replace with actual email)
UPDATE users SET role = 'teacher' WHERE email = 'teacher@example.com';

-- Example: Make user with ID 1 an admin
UPDATE users SET role = 'admin' WHERE id = 1;

-- Example: Make user with ID 2 a teacher
UPDATE users SET role = 'teacher' WHERE id = 2;

-- View all users and their roles
SELECT id, name, email, role, created_at FROM users ORDER BY id;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;
