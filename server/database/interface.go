package database

import (
	"saas-server/models"
	"time"
)

// DBInterface defines the interface for database operations
type DBInterface interface {
	// User operations
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id string) (*models.User, error)
	CreateUser(email, password, name string, emailVerified bool) (*models.User, error)
	UpdateUser(id, name, email string) error
	UpdatePassword(id, hashedPassword string) error
	UserExists(email string) (bool, error)
	GetUserSubscriptionStatus(id string) (*models.UserSubscriptionStatus, error)
	InvalidateUserCache(userID string)

	// Admin operations
	GetUsers(page int, limit int, search string) ([]models.User, int, error)

	// Token management operations
	CreateRefreshToken(userID string, tokenHash string, deviceInfo string, ipAddress string, expiresAt time.Time) error
	GetRefreshToken(tokenHash string) (*models.RefreshToken, error)
	DeleteAllUserRefreshTokens(userID string) error

	// Token blacklist operations
	AddToBlacklist(jti string, userID string, expiresAt time.Time) error
	IsTokenBlacklisted(jti string) (bool, error)
	CleanupExpiredBlacklistedTokens() error //TODO: Implement this

	// Password reset operations
	CreatePasswordResetToken(userID string, token string, expiresAt time.Time) error
	GetPasswordResetToken(token string) (string, error)
	MarkPasswordResetTokenUsed(token string) error

	// Order operations
	GetUserOrders(userID string) ([]models.Orders, error)

	// Subscription operations
	GetSubscriptionByUserID(userID string) (*models.Subscription, error)

	// Additional operations
	CreateOrder(userID string, orderID int, customerID int, productID int, variantID int, status string, subtotalFormatted string, taxFormatted string, totalFormatted string, taxInclusive bool) error
	UpdateOrderRefund(orderID int, refundedAt *time.Time, refundedAmountFormatted string) error
	CreateSubscription(userID string, subscriptionID int, orderID int, customerID int, productID int, variantID int, status string, renewsAt *time.Time, endsAt *time.Time, trialEndsAt *time.Time) error
	UpdateSubscription(subscriptionID int, status string, cancelled bool, productID int, variantID int, renewsAt *time.Time, endsAt *time.Time, trialEndsAt *time.Time) error
	UpdateUserSubscription(userID string, subscriptionID int, status string, productID int, variantID int, renewalDate *time.Time, endDate *time.Time) error
	StoreEmailVerificationToken(token, userID, email string, expiresAt time.Time) error
	VerifyEmail(token string) error
}
