package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"

	"saas-server/database"
	"saas-server/models"
)

// EarlyAccessHandler handles early access waiting list requests
type EarlyAccessHandler struct {
	DB *database.DB
}

// NewEarlyAccessHandler creates a new early access handler
func NewEarlyAccessHandler(db *database.DB) *EarlyAccessHandler {
	return &EarlyAccessHandler{DB: db}
}

// Register handles early access registration requests
func (h *EarlyAccessHandler) Register(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req models.EarlyAccessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[EarlyAccessHandler] Error decoding request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate email
	if !isValidEmail(req.Email) {
		http.Error(w, "Invalid email address", http.StatusBadRequest)
		return
	}

	// Sanitize referrer
	req.Referrer = sanitizeReferrer(req.Referrer)

	// Check if email already exists
	exists, err := h.DB.EarlyAccessEmailExists(req.Email)
	if err != nil {
		log.Printf("[EarlyAccessHandler] Error checking for existing email: %v", err)
		http.Error(w, "Failed to process request", http.StatusInternalServerError)
		return
	}

	if exists {
		// If email exists, just update the referrer if provided
		if req.Referrer != "" {
			err := h.DB.UpdateEarlyAccessReferrer(req.Email, req.Referrer)
			if err != nil {
				log.Printf("[EarlyAccessHandler] Error updating referrer: %v", err)
				// Don't return an error to the client, just log it
			}
		}

		// Return success (don't let users know they've already signed up to prevent email harvesting)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Thank you for your interest in our platform!",
		})
		return
	}

	// Insert new early access record
	err = h.DB.CreateEarlyAccessEntry(req.Email, req.Referrer)
	if err != nil {
		log.Printf("[EarlyAccessHandler] Error inserting record: %v", err)
		http.Error(w, "Failed to register for early access", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Successfully registered for early access",
	})
}

// isValidEmail validates an email address
func isValidEmail(email string) bool {
	// Simple email validation regex
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// sanitizeReferrer cleans and validates a referrer string
func sanitizeReferrer(referrer string) string {
	// Trim whitespace
	referrer = strings.TrimSpace(referrer)

	// If empty, return "direct"
	if referrer == "" {
		return "direct"
	}

	// Remove any protocol (http://, https://)
	referrer = regexp.MustCompile(`^https?://`).ReplaceAllString(referrer, "")

	// Remove paths and parameters
	if parts := strings.Split(referrer, "/"); len(parts) > 0 {
		referrer = parts[0]
	}

	// Remove port if present
	if parts := strings.Split(referrer, ":"); len(parts) > 0 {
		referrer = parts[0]
	}

	// Limit length
	if len(referrer) > 255 {
		referrer = referrer[:255]
	}

	return referrer
}

// GetAllEarlyAccessRegistrations returns all early access registrations
// This is typically an admin-only function
func (h *EarlyAccessHandler) GetAllEarlyAccessRegistrations(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Query database for all registrations
	registrations, err := h.DB.GetAllEarlyAccessEntries()
	if err != nil {
		log.Printf("[EarlyAccessHandler] Error querying registrations: %v", err)
		http.Error(w, "Failed to retrieve registrations", http.StatusInternalServerError)
		return
	}

	// Return registrations
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(registrations)
}
