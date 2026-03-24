-- Update admin user name from DataWaves to DataHarbour
-- Run this SQL in your Neon PostgreSQL dashboard

-- First, let's see current admin users
SELECT id, full_name, email, role 
FROM users 
WHERE role = 'admin' OR email LIKE '%admin%';

-- Update the admin user's full name
UPDATE users 
SET full_name = 'DataHarbour Admin' 
WHERE email = 'admin@dataharbour.com' 
   OR email = 'admin@datawaves.com'
   OR full_name LIKE '%DataWaves Admin%'
   OR full_name LIKE '%DataWaves%';

-- Verify the update
SELECT id, full_name, email, role 
FROM users 
WHERE role = 'admin' OR email LIKE '%admin%';

-- If no admin user exists, create one
INSERT INTO users (full_name, email, password, phone, role) 
VALUES ('DataHarbour Admin', 'admin@dataharbour.com', '$2b$10$rVHGOXHSA5lrvSy6TLWhbOxJqO0kO0oCdUWKDFyKKhjDQN8uEhihm', '+233208494123', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  password = EXCLUDED.password,
  role = EXCLUDED.role;