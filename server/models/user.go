// Package models contains the data models for the application
package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID                   string     `json:"id"`
	Email                string     `json:"email"`
	Password             string     `json:"-"`
	Name                 string     `json:"name"`
	EmailVerified        bool       `json:"email_verified"`
	LatestStatus         string     `json:"latest_status"`
	LatestProductID      int        `json:"latest_product_id,omitempty"`
	LatestVariantID      int        `json:"latest_variant_id,omitempty"`
	LatestSubscriptionID int        `json:"latest_subscription_id,omitempty"`
	LatestRenewalDate    *time.Time `json:"latest_renewal_date,omitempty"`
	LatestEndDate        *time.Time `json:"latest_end_date,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

// UserSubscriptionStatus represents the subscription status of a user
type UserSubscriptionStatus struct {
	Status    *string `json:"status"`
	ProductID *int    `json:"product_id"`
	VariantID *int    `json:"variant_id"`
}

// HashPassword hashes the user's password using bcrypt
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// ComparePassword checks if the provided password matches the hashed password
func (u *User) ComparePassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}
