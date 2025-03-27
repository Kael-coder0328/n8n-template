package database

import (
	"saas-server/models"
	"time"
)

// CreateNewsletterSubscription creates a new newsletter subscription in the database
func (db *DB) CreateNewsletterSubscription(email string) error {
	_, err := db.Exec(
		"INSERT INTO newsletter_subscriptions (email, subscribed, created_at, updated_at) VALUES ($1, $2, $3, $3)",
		email, true, time.Now(),
	)
	return err
}

// NewsletterEmailExists checks if an email already exists in the newsletter_subscriptions table
func (db *DB) NewsletterEmailExists(email string) (bool, error) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM newsletter_subscriptions WHERE email = $1)", email).Scan(&exists)
	return exists, err
}

// UpdateNewsletterSubscription updates the subscription status for an existing newsletter subscription
func (db *DB) UpdateNewsletterSubscription(email string, subscribed bool) error {
	_, err := db.Exec(
		"UPDATE newsletter_subscriptions SET subscribed = $1, updated_at = $2 WHERE email = $3",
		subscribed, time.Now(), email,
	)
	return err
}

// GetAllNewsletterSubscriptions returns all newsletter subscriptions from the database
func (db *DB) GetAllNewsletterSubscriptions() ([]models.NewsletterSubscription, error) {
	rows, err := db.Query(
		"SELECT id, email, subscribed, created_at, updated_at FROM newsletter_subscriptions ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subscriptions []models.NewsletterSubscription
	for rows.Next() {
		var subscription models.NewsletterSubscription
		if err := rows.Scan(
			&subscription.ID,
			&subscription.Email,
			&subscription.Subscribed,
			&subscription.CreatedAt,
			&subscription.UpdatedAt,
		); err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, subscription)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return subscriptions, nil
}
