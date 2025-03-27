package database

import (
	"database/sql"
	"fmt"
	"saas-server/models"
)

// GetUsers retrieves a paginated list of users with optional search
func (db *DB) GetUsers(page int, limit int, search string) ([]models.User, int, error) {
	offset := (page - 1) * limit

	// Base query with all fields
	baseQuery := `
		SELECT 
			u.id, 
			u.email, 
			u.name, 
			u.email_verified,
			COALESCE(u.latest_status, '') as latest_status,
			u.latest_product_id,
			u.latest_variant_id,
			u.latest_subscription_id,
			u.latest_renewal_date,
			u.latest_end_date,
			u.created_at,
			u.updated_at
		FROM users u`

	// Count query
	countQuery := `SELECT COUNT(*) FROM users u`

	// Add search condition if search string is provided
	var args []interface{}
	if search != "" {
		searchCondition := ` WHERE (LOWER(u.name) LIKE LOWER($1) OR LOWER(u.email) LIKE LOWER($1))`
		baseQuery += searchCondition
		countQuery += searchCondition
		args = append(args, fmt.Sprintf("%%%s%%", search))
	}

	// Add pagination
	baseQuery += ` ORDER BY u.created_at DESC LIMIT $` + fmt.Sprintf("%d", len(args)+1) +
		` OFFSET $` + fmt.Sprintf("%d", len(args)+2)
	args = append(args, limit, offset)

	// Get total count
	var total int
	err := db.QueryRow(countQuery, args[:len(args)-2]...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("error counting users: %v", err)
	}

	// Execute the main query
	rows, err := db.Query(baseQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("error querying users: %v", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		var latestStatus sql.NullString
		var latestProductID sql.NullInt64
		var latestVariantID sql.NullInt64
		var latestSubscriptionID sql.NullInt64
		var latestRenewalDate sql.NullTime
		var latestEndDate sql.NullTime

		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.Name,
			&user.EmailVerified,
			&latestStatus,
			&latestProductID,
			&latestVariantID,
			&latestSubscriptionID,
			&latestRenewalDate,
			&latestEndDate,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("error scanning user: %v", err)
		}

		// Always set the fields, even if they're null
		user.LatestStatus = latestStatus.String
		if latestProductID.Valid {
			user.LatestProductID = int(latestProductID.Int64)
		}
		if latestVariantID.Valid {
			user.LatestVariantID = int(latestVariantID.Int64)
		}
		if latestSubscriptionID.Valid {
			user.LatestSubscriptionID = int(latestSubscriptionID.Int64)
		}
		if latestRenewalDate.Valid {
			user.LatestRenewalDate = &latestRenewalDate.Time
		}
		if latestEndDate.Valid {
			user.LatestEndDate = &latestEndDate.Time
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating users: %v", err)
	}

	return users, total, nil
}
