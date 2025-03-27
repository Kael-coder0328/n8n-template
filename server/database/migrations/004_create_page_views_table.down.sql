-- Drop indexes first
DROP INDEX IF EXISTS idx_page_views_created_at;
DROP INDEX IF EXISTS idx_page_views_path;
DROP INDEX IF EXISTS idx_page_views_visitor_id;
DROP INDEX IF EXISTS idx_page_views_user_id;

-- Drop the table
DROP TABLE IF EXISTS page_views;