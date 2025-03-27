-- Drop tables and indexes in reverse order of creation to handle dependencies
DROP INDEX IF EXISTS idx_users_id;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS token_blacklist;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;