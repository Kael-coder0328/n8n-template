package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"saas-server/database"
	"saas-server/middleware"
	"saas-server/models"
	"saas-server/pkg/lemonsqueezy"
)

type UserDataHandler struct {
	DB     database.DBInterface
	client *lemonsqueezy.Client
}

func NewUserDataHandler(db database.DBInterface) *UserDataHandler {
	return &UserDataHandler{
		DB:     db,
		client: lemonsqueezy.NewClient(),
	}
}

// GetUserOrders handles GET /api/user/orders
func (h *UserDataHandler) GetUserOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context using the middleware's GetUserID helper
	userID := middleware.GetUserID(r.Context())
	log.Printf("[UserData] Raw user ID from context: %+v (type: %T)", userID, userID)
	if userID == "" {
		log.Printf("[UserData] Failed to get valid user ID from context")
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}
	log.Printf("[UserData] Validated user ID: %s", userID)

	// Verify user exists
	_, err := h.DB.GetUserByID(userID)
	if err != nil {
		log.Printf("[UserData] User not found in database: %v", err)
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	// Set content type header early
	w.Header().Set("Content-Type", "application/json")

	// Get orders from database
	orders, err := h.DB.GetUserOrders(userID)
	if err != nil {
		// Return empty array for any database error (no rows, table doesn't exist, or other errors)
		json.NewEncoder(w).Encode([]models.Orders{})
		return
	}

	json.NewEncoder(w).Encode(orders)
}

// GetUserSubscription handles GET /api/user/subscription
func (h *UserDataHandler) GetUserSubscription(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context using the middleware's GetUserID helper
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	// Verify user exists
	_, err := h.DB.GetUserByID(userID)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	// Set content type header early
	w.Header().Set("Content-Type", "application/json")

	// Get subscription from database
	subscription, err := h.DB.GetSubscriptionByUserID(userID)
	if err != nil {
		log.Printf("[UserData] Error getting subscription for user %s: %v", userID, err)
		// Return empty array for any database error (no rows, table doesn't exist, or other errors)
		json.NewEncoder(w).Encode([]models.Subscription{})
		return
	}

	json.NewEncoder(w).Encode([]models.Subscription{*subscription})
}

// GetBillingPortal handles GET /api/user/subscription/billing
func (h *UserDataHandler) GetBillingPortal(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get customer ID from query parameter
	customerID := r.URL.Query().Get("customerId")
	if customerID == "" {
		http.Error(w, "Customer ID is required", http.StatusBadRequest)
		return
	}

	// Get customer from LemonSqueezy
	customer, err := h.client.GetCustomer(customerID)
	if err != nil {
		fmt.Printf("Error fetching customer: %v\n", err)
		http.Error(w, "Failed to fetch customer", http.StatusInternalServerError)
		return
	}

	// Extract customer portal URL
	portalURL := customer.Data.Attributes.CustomerPortal.CustomerPortal

	// Return the portal URL
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]string{
		"portalURL": portalURL,
	}); err != nil {
		fmt.Printf("Error encoding response: %v\n", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
