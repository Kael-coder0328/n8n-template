package analytics

import (
	"time"

	"github.com/google/uuid"
)

// PageView represents a single page view event
type PageView struct {
	ID        int64
	UserID    *uuid.UUID
	VisitorID string
	Path      string
	Referrer  string
	UserAgent string
	IPAddress string
	CreatedAt time.Time
}

// PageViewStats represents aggregated statistics for a page
type PageViewStats struct {
	Path      string `json:"path"`
	ViewCount int    `json:"view_count"`
}

// DailyStats represents page views for a single day
type DailyStats struct {
	Date  string `json:"date"`
	Views int    `json:"views"`
}

// ReferrerStats represents count of visits from each referrer
type ReferrerStats struct {
	Referrer string `json:"referrer"`
	Count    int    `json:"count"`
}

// PageViewResponse represents the complete analytics response
type PageViewResponse struct {
	PageStats     []PageViewStats `json:"pageStats"`
	DailyStats    []DailyStats    `json:"dailyStats"`
	ReferrerStats []ReferrerStats `json:"referrerStats"`
	TotalViews    int             `json:"totalViews"`
	UniquePaths   int             `json:"uniquePaths"`
}

// PageViewService defines the interface for page view analytics
type PageViewService interface {
	TrackPageView(view *PageView) error
	GetUserJourney(userID uuid.UUID, startTime, endTime time.Time) ([]PageView, error)
	GetVisitorJourneys(startTime, endTime time.Time) ([]PageView, error)
	GetPageViewStats(startTime, endTime time.Time) (*PageViewResponse, error)
}

type PageViewDB interface {
	TrackPageView(view *PageView) error
	GetUserJourney(userID uuid.UUID, startTime, endTime time.Time) ([]PageView, error)
	GetVisitorJourneys(startTime, endTime time.Time) ([]PageView, error)
	GetPageViewStats(startTime, endTime time.Time) (*PageViewResponse, error)
}

// NewPageView creates a new page view instance
func NewPageView(userID *uuid.UUID, visitorID, path, referrer, userAgent, ipAddress string) *PageView {
	return &PageView{
		UserID:    userID,
		VisitorID: visitorID,
		Path:      path,
		Referrer:  referrer,
		UserAgent: userAgent,
		IPAddress: ipAddress,
		CreatedAt: time.Now(),
	}
}
