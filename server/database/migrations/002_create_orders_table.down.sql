-- Drop indexes first
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_customer_id;
DROP INDEX IF EXISTS idx_orders_order_id;
DROP INDEX IF EXISTS idx_orders_user_id;

-- Drop the table
DROP TABLE IF EXISTS orders;