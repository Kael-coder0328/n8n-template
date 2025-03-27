package models

import (
	"time"
)

// EarlyAccess represents a user who has signed up for early access
type EarlyAccess struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Referrer  string    `json:"referrer,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// EarlyAccessRequest represents the data sent from the frontend
type EarlyAccessRequest struct {
	Email    string `json:"email"`
	Referrer string `json:"referrer,omitempty"`
}
