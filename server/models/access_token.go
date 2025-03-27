package models

import (
	"time"

	"github.com/google/uuid"
)

// AccessToken represents a JWT access token in the database
type AccessToken struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID     uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	TokenHash  string    `json:"token_hash" gorm:"uniqueIndex;not null"`
	DeviceInfo string    `json:"device_info" gorm:"type:text;not null"`
	IPAddress  string    `json:"ip_address" gorm:"type:varchar(45)"`
	IsBlocked  bool      `json:"is_blocked" gorm:"default:false"`
	ExpiresAt  time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	LastUsedAt time.Time `json:"last_used_at"`
}

// TableName specifies the table name for AccessToken
func (AccessToken) TableName() string {
	return "access_tokens"
}
