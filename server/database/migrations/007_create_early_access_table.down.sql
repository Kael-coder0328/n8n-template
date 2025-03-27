-- Drop indexes first
DROP INDEX IF EXISTS idx_early_access_email;
DROP INDEX IF EXISTS idx_early_access_referrer;
DROP INDEX IF EXISTS idx_early_access_created_at;

-- Drop the early_access table
DROP TABLE IF EXISTS early_access; 