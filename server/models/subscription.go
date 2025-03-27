package models

import (
	"time"
)

type Subscription struct {
	ID             int        `json:"id"`
	SubscriptionID string     `json:"subscription_id"`
	UserID         string     `json:"user_id"`
	OrderID        int        `json:"order_id"`
	CustomerID     int        `json:"customer_id"`
	ProductID      int        `json:"product_id"`
	VariantID      int        `json:"variant_id"`
	OrderItemID    int        `json:"order_item_id"`
	Status         string     `json:"status"`
	Cancelled      bool       `json:"cancelled"`
	RenewsAt       *time.Time `json:"renews_at,omitempty"`
	EndsAt         *time.Time `json:"ends_at,omitempty"`
	TrialEndsAt    *time.Time `json:"trial_ends_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}
