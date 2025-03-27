package models

import (
	"time"
)

// NewsletterSubscription represents a newsletter subscriber
type NewsletterSubscription struct {
	ID         int       `json:"id"`
	Email      string    `json:"email"`
	Subscribed bool      `json:"subscribed"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// NewsletterSubscriptionRequest represents the data sent from the frontend
type NewsletterSubscriptionRequest struct {
	Email string `json:"email"`
}
