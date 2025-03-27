-- Add indexes for subscription-related columns
CREATE INDEX IF NOT EXISTS idx_users_latest_status ON users(latest_status);
CREATE INDEX IF NOT EXISTS idx_users_latest_product_id ON users(latest_product_id);
CREATE INDEX IF NOT EXISTS idx_users_latest_variant_id ON users(latest_variant_id);

-- Composite index for all subscription fields for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_lookup 
ON users(latest_status, latest_product_id, latest_variant_id); 