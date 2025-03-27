package database

import (
	"saas-server/models"
	"time"
)

// CreateEarlyAccessEntry creates a new early access entry in the database
func (db *DB) CreateEarlyAccessEntry(email, referrer string) error {
	_, err := db.Exec(
		"INSERT INTO early_access (email, referrer, created_at, updated_at) VALUES ($1, $2, $3, $3)",
		email, referrer, time.Now(),
	)
	return err
}

// EarlyAccessEmailExists checks if an email already exists in the early access table
func (db *DB) EarlyAccessEmailExists(email string) (bool, error) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM early_access WHERE email = $1)", email).Scan(&exists)
	return exists, err
}

// UpdateEarlyAccessReferrer updates the referrer for an existing early access entry
func (db *DB) UpdateEarlyAccessReferrer(email, referrer string) error {
	_, err := db.Exec(
		"UPDATE early_access SET referrer = $1, updated_at = $2 WHERE email = $3",
		referrer, time.Now(), email,
	)
	return err
}

// GetAllEarlyAccessEntries returns all early access entries from the database
func (db *DB) GetAllEarlyAccessEntries() ([]models.EarlyAccess, error) {
	rows, err := db.Query(
		"SELECT id, email, referrer, created_at, updated_at FROM early_access ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.EarlyAccess
	for rows.Next() {
		var entry models.EarlyAccess
		if err := rows.Scan(
			&entry.ID,
			&entry.Email,
			&entry.Referrer,
			&entry.CreatedAt,
			&entry.UpdatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return entries, nil
}
