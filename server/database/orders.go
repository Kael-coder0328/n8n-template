package database

import (
	"saas-server/models"
	"time"
)

// CreateOrder creates a new order record in the database
func (db *DB) CreateOrder(userID string, orderID int, customerID int, productID int, variantID int, status string, subtotalFormatted string, taxFormatted string, totalFormatted string, taxInclusive bool) error {
	query := `
		INSERT INTO orders (
			user_id, order_id, customer_id, product_id, variant_id, 
			status, subtotal_formatted, tax_formatted, total_formatted,
			tax_inclusive, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	_, err := db.Exec(query, userID, orderID, customerID, productID, variantID,
		status, subtotalFormatted, taxFormatted, totalFormatted, taxInclusive)
	return err
}

// UpdateOrderStatus updates the status and refund information of an order
func (db *DB) UpdateOrderStatus(orderID int, status string, refunded bool, refundedAt *time.Time) error {
	query := `
		UPDATE orders 
		SET status = $1, refunded_at = $2, updated_at = NOW()
		WHERE order_id = $3`

	_, err := db.Exec(query, status, refundedAt, orderID)
	return err
}

// UpdateOrderRefund updates the order's refund status and related information
func (db *DB) UpdateOrderRefund(orderID int, refundedAt *time.Time, refundedAmountFormatted string) error {
	query := `
		UPDATE orders
		SET status = 'refunded', 
		    refunded_at = $1,
		    refunded_amount_formatted = $2,
		    updated_at = CURRENT_TIMESTAMP
		WHERE order_id = $3`

	_, err := db.Exec(query, refundedAt, refundedAmountFormatted, orderID)
	return err
}

// GetUserOrders retrieves all orders for a given user
func (db *DB) GetUserOrders(userID string) ([]models.Orders, error) {
	query := `
		SELECT id, order_id, user_id, customer_id, status,
		       refunded_at, product_id, variant_id, subtotal_formatted,
		       tax_formatted, total_formatted, tax_inclusive, refunded_amount_formatted,
		       created_at, updated_at
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Orders
	for rows.Next() {
		var order models.Orders
		err := rows.Scan(
			&order.ID,
			&order.OrderID,
			&order.UserID,
			&order.CustomerID,
			&order.Status,
			&order.RefundedAt,
			&order.ProductID,
			&order.VariantID,
			&order.SubtotalFormatted,
			&order.TaxFormatted,
			&order.TotalFormatted,
			&order.TaxInclusive,
			&order.RefundedAmountFormatted,
			&order.CreatedAt,
			&order.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, rows.Err()
}
