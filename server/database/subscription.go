package database

import (
	"saas-server/models"
	"sync"
	"strconv"
	"time"
	"database/sql"
	"log"

	"github.com/google/uuid"
)

// Cache management
var (
	subscriptionCache = make(map[string]interface{})
	cacheMutex        sync.RWMutex
)

// CreateSubscription creates a new subscription record in the database
func (db *DB) CreateSubscription(userID string, subscriptionID int, orderID int, customerID int, productID int, variantID int, status string, renewsAt *time.Time, endsAt *time.Time, trialEndsAt *time.Time) error {
	query := `
		INSERT INTO subscriptions (
			subscription_id, user_id, order_id, customer_id, product_id, variant_id,
			status, renews_at, ends_at, trial_ends_at,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`
	_, err := db.Exec(query,
		subscriptionID, userID, orderID, customerID, productID, variantID,
		status, renewsAt, endsAt, trialEndsAt,
	)
	return err
}

// UpdateSubscription updates an existing subscription record
func (db *DB) UpdateSubscription(subscriptionID int, status string, cancelled bool, productID int, variantID int, renewsAt *time.Time, endsAt *time.Time, trialEndsAt *time.Time) error {
	query := `
		UPDATE subscriptions 
		SET status = $1,
		    cancelled = $2,
		    product_id = $3,
		    variant_id = $4,
		    renews_at = $5,
		    ends_at = $6,
		    trial_ends_at = $7,
		    updated_at = CURRENT_TIMESTAMP
		WHERE subscription_id = $8
	`
	_, err := db.Exec(query, status, cancelled, productID, variantID, renewsAt, endsAt, trialEndsAt, subscriptionID)
	return err
}

// GetSubscriptionByUserID retrieves a subscription by user ID
func (db *DB) GetSubscriptionByUserID(userID string) (*models.Subscription, error) {
	var subscription models.Subscription
	var subscriptionIDInt int
	query := `
		SELECT id, subscription_id, user_id, customer_id, product_id, variant_id,
		       status, cancelled, renews_at, ends_at, trial_ends_at,
		       created_at, updated_at
		FROM subscriptions
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`
	err := db.QueryRow(query, userID).Scan(
		&subscription.ID,
		&subscriptionIDInt,
		&subscription.UserID,
		&subscription.CustomerID,
		&subscription.ProductID,
		&subscription.VariantID,
		&subscription.Status,
		&subscription.Cancelled,
		&subscription.RenewsAt,
		&subscription.EndsAt,
		&subscription.TrialEndsAt,
		&subscription.CreatedAt,
		&subscription.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	// Convert subscription_id to string
	subscription.SubscriptionID = strconv.Itoa(subscriptionIDInt)
	return &subscription, nil
}


// UpdateUserSubscription updates a user's subscription in the database
func (db *DB) UpdateUserSubscription(userID string, subscriptionID int, status string, productID int, variantID int, renewalDate *time.Time, endDate *time.Time) error {
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("[DB] Error parsing UUID: %v", err)
		return err
	}

	query := `
		UPDATE users
		SET latest_subscription_id = $2,
			latest_status = $3,
			latest_product_id = $4,
			latest_variant_id = $5,
			latest_renewal_date = $6,
			latest_end_date = $7,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`

	result, err := db.Exec(query, parsedID, subscriptionID, status, productID, variantID, renewalDate, endDate)
	if err != nil {
		log.Printf("[DB] Error executing update query: %v", err)
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		log.Printf("[DB] Error getting affected rows: %v", err)
		return err
	}

	if rows == 0 {
		log.Printf("[DB] No rows affected - user not found with ID: %s", userID)
		return sql.ErrNoRows
	}

	return nil
}


// GetUserSubscriptionStatus retrieves only the subscription-related fields
func (db *DB) GetUserSubscriptionStatus(id string) (*models.UserSubscriptionStatus, error) {
	var nullStatus sql.NullString
	var nullProductID sql.NullInt64
	var nullVariantID sql.NullInt64

	query := `
		SELECT latest_status, latest_product_id, latest_variant_id
		FROM users
		WHERE id = $1`

	err := db.QueryRow(query, id).Scan(
		&nullStatus,
		&nullProductID,
		&nullVariantID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Only create the status object if at least one field is not null
	if !nullStatus.Valid && !nullProductID.Valid && !nullVariantID.Valid {
		return nil, nil
	}

	status := &models.UserSubscriptionStatus{}

	if nullStatus.Valid {
		status.Status = &nullStatus.String
	}
	if nullProductID.Valid {
		productID := int(nullProductID.Int64)
		status.ProductID = &productID
	}
	if nullVariantID.Valid {
		variantID := int(nullVariantID.Int64)
		status.VariantID = &variantID
	}

	return status, nil
}

// InvalidateUserCache removes a user's data from the cache
func (db *DB) InvalidateUserCache(userID string) {
	cacheMutex.Lock()
	delete(subscriptionCache, userID)
	cacheMutex.Unlock()
}
