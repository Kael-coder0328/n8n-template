package database

import (
	"time"

	"saas-server/pkg/analytics"

	"github.com/google/uuid"
)

// TrackPageView stores a page view event in the database
func (db *DB) TrackPageView(view *analytics.PageView) error {
	query := `
		INSERT INTO page_views (user_id, visitor_id, path, referrer, user_agent, ip_address, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := db.Exec(query,
		view.UserID, view.VisitorID, view.Path,
		view.Referrer, view.UserAgent, view.IPAddress,
		view.CreatedAt,
	)
	return err
}

// GetUserJourney retrieves the page view history for a specific user within a time range
func (db *DB) GetUserJourney(userID uuid.UUID, startTime, endTime time.Time) ([]analytics.PageView, error) {
	query := `
		SELECT id, user_id, visitor_id, path, referrer, user_agent, ip_address, created_at
		FROM page_views
		WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
		ORDER BY created_at ASC
	`

	rows, err := db.Query(query, userID, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pageViews []analytics.PageView
	for rows.Next() {
		var view analytics.PageView
		err := rows.Scan(
			&view.ID, &view.UserID, &view.VisitorID,
			&view.Path, &view.Referrer, &view.UserAgent,
			&view.IPAddress, &view.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		pageViews = append(pageViews, view)
	}

	return pageViews, nil
}

// GetVisitorJourneys retrieves all visitor page views within a time range
func (db *DB) GetVisitorJourneys(startTime, endTime time.Time) ([]analytics.PageView, error) {
	query := `
		SELECT id, user_id, visitor_id, path, referrer, user_agent, ip_address, created_at
		FROM page_views
		WHERE created_at BETWEEN $1 AND $2
		ORDER BY visitor_id, created_at ASC
	`

	rows, err := db.Query(query, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pageViews []analytics.PageView
	for rows.Next() {
		var view analytics.PageView
		err := rows.Scan(
			&view.ID, &view.UserID, &view.VisitorID,
			&view.Path, &view.Referrer, &view.UserAgent,
			&view.IPAddress, &view.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		pageViews = append(pageViews, view)
	}

	return pageViews, nil
}

// GetPageViewStats retrieves aggregated page view statistics within a time range
func (db *DB) GetPageViewStats(startTime, endTime time.Time) (*analytics.PageViewResponse, error) {
	// Get page stats
	pageStatsQuery := `
		SELECT path, COUNT(*) as view_count
		FROM page_views
		WHERE created_at BETWEEN $1 AND $2
		GROUP BY path
		ORDER BY view_count DESC
	`

	pageStatsRows, err := db.Query(pageStatsQuery, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer pageStatsRows.Close()

	var pageStats []analytics.PageViewStats
	for pageStatsRows.Next() {
		var stat analytics.PageViewStats
		err := pageStatsRows.Scan(&stat.Path, &stat.ViewCount)
		if err != nil {
			return nil, err
		}
		pageStats = append(pageStats, stat)
	}

	// Get daily stats
	dailyStatsQuery := `
		SELECT DATE(created_at) as date, COUNT(*) as views
		FROM page_views
		WHERE created_at BETWEEN $1 AND $2
		GROUP BY DATE(created_at)
		ORDER BY date ASC
	`

	dailyStatsRows, err := db.Query(dailyStatsQuery, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer dailyStatsRows.Close()

	var dailyStats []analytics.DailyStats
	for dailyStatsRows.Next() {
		var stat analytics.DailyStats
		err := dailyStatsRows.Scan(&stat.Date, &stat.Views)
		if err != nil {
			return nil, err
		}
		dailyStats = append(dailyStats, stat)
	}

	// Get referrer stats
	referrerStatsQuery := `
		SELECT 
			COALESCE(referrer, 'direct') as referrer,
			COUNT(*) as count
		FROM page_views
		WHERE created_at BETWEEN $1 AND $2
		GROUP BY COALESCE(referrer, 'direct')
		ORDER BY count DESC
	`

	referrerStatsRows, err := db.Query(referrerStatsQuery, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer referrerStatsRows.Close()

	var referrerStats []analytics.ReferrerStats
	for referrerStatsRows.Next() {
		var stat analytics.ReferrerStats
		err := referrerStatsRows.Scan(&stat.Referrer, &stat.Count)
		if err != nil {
			return nil, err
		}
		referrerStats = append(referrerStats, stat)
	}

	// Get total views and unique paths
	totalsQuery := `
		SELECT 
			COUNT(*) as total_views,
			COUNT(DISTINCT path) as unique_paths
		FROM page_views
		WHERE created_at BETWEEN $1 AND $2
	`

	var totalViews, uniquePaths int
	err = db.QueryRow(totalsQuery, startTime, endTime).Scan(&totalViews, &uniquePaths)
	if err != nil {
		return nil, err
	}

	return &analytics.PageViewResponse{
		PageStats:     pageStats,
		DailyStats:    dailyStats,
		ReferrerStats: referrerStats,
		TotalViews:    totalViews,
		UniquePaths:   uniquePaths,
	}, nil
}
