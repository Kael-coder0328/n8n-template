-- Create early_access table for storing waiting list signup information
CREATE TABLE IF NOT EXISTS early_access (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    referrer VARCHAR(255), -- Where the user came from (direct, social, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access(email);
CREATE INDEX IF NOT EXISTS idx_early_access_referrer ON early_access(referrer);
CREATE INDEX IF NOT EXISTS idx_early_access_created_at ON early_access(created_at);

-- Add a comment to the table
COMMENT ON TABLE early_access IS 'Stores information about users who signed up for early access to the platform'; 