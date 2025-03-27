-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL,
    customer_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    refunded_at TIMESTAMP WITH TIME ZONE,
    product_id INTEGER NOT NULL,
    variant_id INTEGER NOT NULL,
    subtotal_formatted VARCHAR(50) NOT NULL,
    tax_formatted VARCHAR(50) NOT NULL,
    total_formatted VARCHAR(50) NOT NULL,
    tax_inclusive BOOLEAN NOT NULL DEFAULT false,
    refunded_amount_formatted VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_variant_id ON orders(variant_id);