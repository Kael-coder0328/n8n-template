-- Drop indexes first
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_customer_id;
DROP INDEX IF EXISTS idx_subscriptions_subscription_id;
DROP INDEX IF EXISTS idx_subscriptions_user_id;

-- Drop the table
DROP TABLE IF EXISTS subscriptions;