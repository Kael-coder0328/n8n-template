package database

import (
	"database/sql"
	"errors"
	"log"
	"saas-server/models"
	"time"

	"github.com/google/uuid"
)

// CreateRefreshToken creates a new refresh token in the database
func (db *DB) CreateRefreshToken(userID string, tokenHash string, deviceInfo string, ipAddress string, expiresAt time.Time) error {
	query := `
		INSERT INTO refresh_tokens (id, user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used_at, is_blocked)
		VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)`

	// Use provided device info and IP address, or fallback to defaults
	if deviceInfo == "" {
		deviceInfo = "Unknown Device"
	}
	if ipAddress == "" {
		ipAddress = "0.0.0.0"
	}

	// Generate a new UUID for the token
	tokenID := uuid.New().String()

	_, err := db.Exec(query, tokenID, userID, tokenHash, deviceInfo, ipAddress, expiresAt)
	return err
}

// GetRefreshToken retrieves a refresh token from the database by its hash
func (db *DB) GetRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	query := `
		SELECT id, user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used_at, is_blocked
		FROM refresh_tokens
		WHERE token_hash = $1
		AND expires_at > CURRENT_TIMESTAMP
		AND is_blocked = false`

	err := db.QueryRow(query, tokenHash).Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.DeviceInfo,
		&token.IPAddress,
		&token.ExpiresAt,
		&token.CreatedAt,
		&token.LastUsedAt,
		&token.IsBlocked,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &token, nil
}

// DeleteAllUserRefreshTokens removes all refresh tokens for a user
func (db *DB) DeleteAllUserRefreshTokens(userID string) error {
	query := `
		UPDATE refresh_tokens
		SET is_blocked = true
		WHERE user_id = $1`

	_, err := db.Exec(query, userID)
	return err
}

// AddToBlacklist adds a token to the blacklist
func (db *DB) AddToBlacklist(jti string, userID string, expiresAt time.Time) error {
	query := `
		INSERT INTO token_blacklist (jti, user_id, expires_at)
		VALUES ($1, $2, $3)`

	_, err := db.Exec(query, jti, userID, expiresAt)
	return err
}

// IsTokenBlacklisted checks if a token is blacklisted
func (db *DB) IsTokenBlacklisted(jti string) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS(
			SELECT 1 FROM token_blacklist
			WHERE jti = $1 AND expires_at > CURRENT_TIMESTAMP
		)`

	err := db.QueryRow(query, jti).Scan(&exists)
	return exists, err
}

// CleanupExpiredBlacklistedTokens removes expired tokens from the blacklist
func (db *DB) CleanupExpiredBlacklistedTokens() error {
	query := `DELETE FROM token_blacklist WHERE expires_at <= CURRENT_TIMESTAMP`
	_, err := db.Exec(query)
	return err
}

// CreatePasswordResetToken creates a new password reset token for a user
func (db *DB) CreatePasswordResetToken(userID string, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO password_reset_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)`

	_, err := db.Exec(query, userID, token, expiresAt)
	return err
}

// GetPasswordResetToken retrieves a valid password reset token
func (db *DB) GetPasswordResetToken(token string) (string, error) {
	var userID string
	query := `
		SELECT user_id
		FROM password_reset_tokens
		WHERE token = $1 
		AND expires_at > CURRENT_TIMESTAMP
		AND used_at IS NULL`

	err := db.QueryRow(query, token).Scan(&userID)
	if err == sql.ErrNoRows {
		return "", errors.New("token not found")
	}
	return userID, err
}

// MarkPasswordResetTokenUsed marks a password reset token as used
func (db *DB) MarkPasswordResetTokenUsed(token string) error {
	query := `
		UPDATE password_reset_tokens
		SET used_at = CURRENT_TIMESTAMP
		WHERE token = $1
		AND used_at IS NULL
		AND expires_at > CURRENT_TIMESTAMP`

	result, err := db.Exec(query, token)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("token not found")
	}

	return nil
}

// StoreEmailVerificationToken stores a new email verification token
func (db *DB) StoreEmailVerificationToken(token, userID, email string, expiresAt time.Time) error {
	query := `
		INSERT INTO email_verification_tokens (token, user_id, email, expires_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := db.Exec(query, token, userID, email, expiresAt)
	return err
}

// VerifyEmail verifies the email using the token and updates the user's email_verified status
func (db *DB) VerifyEmail(token string) error {
	tx, err := db.Begin()
	if err != nil {
		log.Printf("[DB] Failed to begin transaction: %v", err)
		return err
	}
	defer tx.Rollback()

	// First, let's check if the token exists at all
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM email_verification_tokens WHERE token = $1)`
	err = tx.QueryRow(checkQuery, token).Scan(&exists)
	if err != nil {
		log.Printf("[DB] Error checking token existence: %v", err)
		return err
	}

	if !exists {
		log.Printf("[DB] Token does not exist: %s", token)
		return errors.New("invalid or expired token")
	}

	// Now check the token's status and get user info
	var userID string
	var expiresAt time.Time
	var usedAt sql.NullTime
	var emailVerified bool
	query := `
		SELECT evt.user_id, evt.expires_at, evt.used_at, u.email_verified
		FROM email_verification_tokens evt
		JOIN users u ON u.id = evt.user_id
		WHERE evt.token = $1
	`
	err = tx.QueryRow(query, token).Scan(&userID, &expiresAt, &usedAt, &emailVerified)
	if err != nil {
		log.Printf("[DB] Error querying token details: %v", err)
		if err == sql.ErrNoRows {
			return errors.New("invalid or expired token")
		}
		return err
	}

	if emailVerified {
		return nil
	}

	if usedAt.Valid {
		return errors.New("token already used")
	}

	if time.Now().After(expiresAt) {
		return errors.New("token has expired")
	}

	// Mark token as used
	_, err = tx.Exec(`
		UPDATE email_verification_tokens
		SET used_at = CURRENT_TIMESTAMP
		WHERE token = $1
	`, token)
	if err != nil {
		return err
	}

	// Update user's email_verified status
	result, err := tx.Exec(`
		UPDATE users
		SET email_verified = true
		WHERE id = $1
	`, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return errors.New("user not found")
	}

	return tx.Commit()
}
