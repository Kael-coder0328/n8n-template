package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"saas-server/database"
	"saas-server/pkg/lemonsqueezy"
	"strconv"
)

type CheckoutHandler struct {
	client *lemonsqueezy.Client
	db     database.DBInterface
}

type CheckoutRequest struct {
	ProductID string `json:"productId"`
	VariantID string `json:"variantId"`
	Email     string `json:"email"`
	UserID    string `json:"userId"`
}

func NewCheckoutHandler(db database.DBInterface) *CheckoutHandler {
	return &CheckoutHandler{client: lemonsqueezy.NewClient(), db: db}
}

// CreateCheckout handles POST /api/checkout
func (h *CheckoutHandler) CreateCheckout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if user already has a subscription
	subscription, err := h.db.GetSubscriptionByUserID(req.UserID)
	if err == nil && subscription != nil {
		// User has an active subscription, get their customer portal URL
		customer, err := h.client.GetCustomer(strconv.Itoa(subscription.CustomerID))
		if err != nil {
			http.Error(w, "Failed to fetch customer portal", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"portalURL": customer.Data.Attributes.CustomerPortal.CustomerPortal,
		})
		return
	}

	// Get and validate required environment variables
	storeIDStr := os.Getenv("LEMON_SQUEEZY_STORE_ID")
	signingSecret := os.Getenv("LEMON_SQUEEZY_SIGNING_SECRET")

	if storeIDStr == "" || signingSecret == "" {
		http.Error(w, "Missing required environment configuration", http.StatusInternalServerError)
		return
	}

	checkout, err := h.client.CreateCheckout(
		storeIDStr,
		req.VariantID,
		map[string]interface{}{
			"email": req.Email,
			"checkout_data": lemonsqueezy.CheckoutData{
				Custom: map[string]interface{}{
					"user_id": req.UserID,
				},
			},
		},
	)

	if err != nil {
		http.Error(w, "Failed to create checkout", http.StatusInternalServerError)
		return
	}

	// Extract checkout URL from the response
	checkoutURL := checkout.Data.Attributes.URL

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"checkoutURL": checkoutURL,
	})
}
