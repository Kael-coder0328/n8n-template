package models

import (
	"time"
)

// RefreshToken represents a refresh token in the database
type RefreshToken struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	TokenHash  string    `json:"token_hash"`
	DeviceInfo string    `json:"device_info"`
	IPAddress  string    `json:"ip_address"`
	IsBlocked  bool      `json:"is_blocked"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
	LastUsedAt time.Time `json:"last_used_at"`
}
