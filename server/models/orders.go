package models

import (
	"time"
)

type Orders struct {
	ID                      int        `json:"id"`
	OrderID                 int        `json:"order_id"`
	UserID                  string     `json:"user_id"`
	CustomerID              int        `json:"customer_id"`
	ProductID               int        `json:"product_id"`
	VariantID               int        `json:"variant_id"`
	Status                  string     `json:"status"`
	SubtotalFormatted       string     `json:"subtotal_formatted"`
	TaxFormatted            string     `json:"tax_formatted"`
	TotalFormatted          string     `json:"total_formatted"`
	TaxInclusive            bool       `json:"tax_inclusive"`
	RefundedAt              *time.Time `json:"refunded_at,omitempty"`
	RefundedAmountFormatted string     `json:"refunded_amount_formatted,omitempty"`
	CreatedAt               time.Time  `json:"created_at"`
	UpdatedAt               time.Time  `json:"updated_at"`
}
