-- Create newsletter_subscriptions table for storing newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscriptions(subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at);

-- Add a comment to the table
COMMENT ON TABLE newsletter_subscriptions IS 'Stores information about users who subscribed to the newsletter'; 