package cleanup

import (
	"log"
	"time"

	"saas-server/models"

	"gorm.io/gorm"
)

// TokenCleanupService handles the cleanup of expired tokens
type TokenCleanupService struct {
	db *gorm.DB
}

// NewTokenCleanupService creates a new instance of TokenCleanupService
func NewTokenCleanupService(db *gorm.DB) *TokenCleanupService {
	return &TokenCleanupService{
		db: db,
	}
}

// StartCleanupJob starts the background job to clean up expired tokens
func (s *TokenCleanupService) StartCleanupJob() {
	// Run cleanup every hour
	ticker := time.NewTicker(1 * time.Hour)
	go func() {
		for range ticker.C {
			if err := s.cleanupExpiredTokens(); err != nil {
				log.Printf("Error cleaning up expired tokens: %v", err)
			}
		}
	}()
}

// cleanupExpiredTokens removes expired tokens and blacklist entries
func (s *TokenCleanupService) cleanupExpiredTokens() error {
	now := time.Now()

	// Delete expired refresh tokens
	result := s.db.Where("expires_at < ?", now).Delete(&models.RefreshToken{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected > 0 {
		log.Printf("Deleted %d expired refresh tokens", result.RowsAffected)
	}

	// Delete expired access tokens
	result = s.db.Where("expires_at < ?", now).Delete(&models.AccessToken{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected > 0 {
		log.Printf("Deleted %d expired access tokens", result.RowsAffected)
	}

	// Clean up expired entries from token blacklist
	result = s.db.Exec("DELETE FROM token_blacklist WHERE expires_at < ?", now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected > 0 {
		log.Printf("Deleted %d expired blacklist entries", result.RowsAffected)
	}

	// Clean up expired password reset tokens
	result = s.db.Exec("DELETE FROM password_reset_tokens WHERE expires_at < ?", now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected > 0 {
		log.Printf("Deleted %d expired password reset tokens", result.RowsAffected)
	}

	return nil
}
