-- Drop newsletter_subscriptions table and related indexes
DROP INDEX IF EXISTS idx_newsletter_email;
DROP INDEX IF EXISTS idx_newsletter_subscribed;
DROP INDEX IF EXISTS idx_newsletter_created_at;
DROP TABLE IF EXISTS newsletter_subscriptions; 