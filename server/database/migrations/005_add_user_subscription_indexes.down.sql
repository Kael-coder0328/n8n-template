-- Drop subscription-related indexes
DROP INDEX IF EXISTS idx_users_latest_status;
DROP INDEX IF EXISTS idx_users_latest_product_id;
DROP INDEX IF EXISTS idx_users_latest_variant_id;
DROP INDEX IF EXISTS idx_users_subscription_lookup; 