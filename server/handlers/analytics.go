package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"saas-server/pkg/analytics"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AnalyticsHandler struct {
	pageViewService analytics.PageViewService
}

type PageViewRequest struct {
	Path     string `json:"path"`
	Referrer string `json:"referrer,omitempty"`
}

type JourneyRequest struct {
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	UserID    string    `json:"user_id,omitempty"`
	VisitorID string    `json:"visitor_id,omitempty"`
}

func NewAnalyticsHandler(pageViewService analytics.PageViewService) *AnalyticsHandler {
	return &AnalyticsHandler{pageViewService: pageViewService}
}

// TrackPageView handles the POST request for tracking page views
func (h *AnalyticsHandler) TrackPageView(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req PageViewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user ID from access token cookie
	var userIDPtr *uuid.UUID
	if cookie, err := r.Cookie("access_token"); err == nil {
		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				if userIDStr, ok := claims["sub"].(string); ok {
					if userID, err := uuid.Parse(userIDStr); err == nil {
						userIDPtr = &userID
					}
				}
			}
		}
	}

	// Use visitor ID from header only if user is not authenticated
	var visitorID string
	if userIDPtr == nil {
		// Generate time-based visitor ID if not provided
		visitorID = fmt.Sprintf("v_%d", time.Now().UnixNano())
	}

	// Create page view
	pageView := analytics.NewPageView(
		userIDPtr,
		visitorID,
		req.Path,
		req.Referrer,
		r.UserAgent(),
		r.RemoteAddr,
	)

	// Track the page view
	if err := h.pageViewService.TrackPageView(pageView); err != nil {
		http.Error(w, "Failed to track page view", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// GetUserJourney handles the GET request for retrieving a user's journey
func (h *AnalyticsHandler) GetUserJourney(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req JourneyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	// Convert string to UUID
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	// Get user journey
	journey, err := h.pageViewService.GetUserJourney(userID, req.StartTime, req.EndTime)
	if err != nil {
		http.Error(w, "Failed to retrieve user journey", http.StatusInternalServerError)
		return
	}

	// Send response
	json.NewEncoder(w).Encode(journey)
}

// GetVisitorJourney handles the GET request for retrieving visitor journeys
func (h *AnalyticsHandler) GetVisitorJourney(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req JourneyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get all visitor journeys for the time period
	journeys, err := h.pageViewService.GetVisitorJourneys(req.StartTime, req.EndTime)
	if err != nil {
		http.Error(w, "Failed to retrieve visitor journeys", http.StatusInternalServerError)
		return
	}

	// Send response
	json.NewEncoder(w).Encode(journeys)
}

// GetPageViewStats handles the POST request for retrieving page view statistics
func (h *AnalyticsHandler) GetPageViewStats(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req JourneyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get page view statistics
	stats, err := h.pageViewService.GetPageViewStats(req.StartTime, req.EndTime)
	if err != nil {
		http.Error(w, "Failed to retrieve page view statistics", http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
