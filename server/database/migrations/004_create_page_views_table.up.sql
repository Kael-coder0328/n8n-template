-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    visitor_id VARCHAR(255),
    path VARCHAR(255) NOT NULL,
    referrer VARCHAR(255),
    user_agent VARCHAR(512),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);