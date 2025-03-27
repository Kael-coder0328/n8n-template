package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"saas-server/models"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type WebhookPayload struct {
	Data WebhookData `json:"data"`
	Meta struct {
		EventName  string            `json:"event_name"`
		CustomData map[string]string `json:"custom_data"`
		TestMode   bool              `json:"test_mode"`
		WebhookID  string            `json:"webhook_id"`
	} `json:"meta"`
}

type WebhookData struct {
	Type       string            `json:"type"`
	ID         string            `json:"id"`
	Links      WebhookLinks      `json:"links"`
	Attributes WebhookAttributes `json:"attributes"`
}

type WebhookLinks struct {
	Self string `json:"self"`
}

type WebhookAttributes interface{}

type OrderAttributes struct {
	StoreID                 int        `json:"store_id"`
	CustomerID              int        `json:"customer_id"`
	OrderID                 int        `json:"order_number"`
	Status                  string     `json:"status"`
	UserName                string     `json:"user_name"`
	UserEmail               string     `json:"user_email"`
	Refunded                bool       `json:"refunded"`
	RefundedAt              *time.Time `json:"refunded_at"`
	CreatedAt               time.Time  `json:"created_at"`
	UpdatedAt               time.Time  `json:"updated_at"`
	SubtotalFormatted       string     `json:"subtotal_formatted"`
	TaxFormatted            string     `json:"tax_formatted"`
	TotalFormatted          string     `json:"total_formatted"`
	TaxInclusive            bool       `json:"tax_inclusive"`
	RefundedAmountFormatted string     `json:"refunded_amount_formatted"`
	URLs                    struct {
		Receipt string `json:"receipt"`
	} `json:"urls"`
	FirstOrderItem struct {
		ProductID int `json:"product_id"`
		VariantID int `json:"variant_id"`
	} `json:"first_order_item"`
}

type SubscriptionAttributes struct {
	URLs struct {
		CustomerPortal                   string `json:"customer_portal"`
		UpdatePaymentMethod              string `json:"update_payment_method"`
		CustomerPortalUpdateSubscription string `json:"customer_portal_update_subscription"`
	} `json:"urls"`
	Pause *struct {
		Mode      string     `json:"mode"`
		ResumesAt *time.Time `json:"resumes_at"`
	} `json:"pause"`
	Status                string     `json:"status"`
	EndsAt                *time.Time `json:"ends_at"`
	OrderID               int        `json:"order_id"`
	StoreID               int        `json:"store_id"`
	Cancelled             bool       `json:"cancelled"`
	RenewsAt              *time.Time `json:"renews_at"`
	TestMode              bool       `json:"test_mode"`
	UserName              string     `json:"user_name"`
	CardBrand             string     `json:"card_brand"`
	CreatedAt             time.Time  `json:"created_at"`
	ProductID             int        `json:"product_id"`
	UpdatedAt             time.Time  `json:"updated_at"`
	UserEmail             string     `json:"user_email"`
	VariantID             int        `json:"variant_id"`
	CustomerID            int        `json:"customer_id"`
	ProductName           string     `json:"product_name"`
	VariantName           string     `json:"variant_name"`
	OrderItemID           int        `json:"order_item_id"`
	TrialEndsAt           *time.Time `json:"trial_ends_at"`
	BillingAnchor         int        `json:"billing_anchor"`
	CardLastFour          string     `json:"card_last_four"`
	StatusFormatted       string     `json:"status_formatted"`
	FirstSubscriptionItem struct {
		ID             int       `json:"id"`
		PriceID        int       `json:"price_id"`
		Quantity       int       `json:"quantity"`
		CreatedAt      time.Time `json:"created_at"`
		UpdatedAt      time.Time `json:"updated_at"`
		IsUsageBased   bool      `json:"is_usage_based"`
		SubscriptionID int       `json:"subscription_id"`
	} `json:"first_subscription_item"`
}

func validateWebhookSignature(payload []byte, signature string, secret string) bool {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	expectedSignature := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

// Database defines the minimal database operations required by the webhook handler
// Implemented by database.DBInterface
type Database interface {
	// Order operations
	CreateOrder(userID string, orderID int, customerID int, productID int, variantID int, status string, subtotalFormatted string, taxFormatted string, totalFormatted string, taxInclusive bool) error
	UpdateOrderRefund(orderID int, refundedAt *time.Time, refundedAmountFormatted string) error

	// Subscription operations
	GetSubscriptionByUserID(userID string) (*models.Subscription, error)
	CreateSubscription(userID string, subscriptionID int, orderID int, customerID int, productID int, variantID int, status string, renewsAt *time.Time, endsAt *time.Time, trialEndsAt *time.Time) error
	UpdateSubscription(subscriptionID int, status string, cancelled bool, productID int, variantID int, renewsAt *time.Time, endsAt *time.Time, trialEndsAt *time.Time) error
	UpdateUserSubscription(userID string, subscriptionID int, status string, productID int, variantID int, renewalDate *time.Time, endDate *time.Time) error

	// Cache operations
	InvalidateUserCache(userID string)
}

type WebhookHandler struct {
	DB Database
}

func (h *WebhookHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	log.Printf("[Webhook] Received new webhook request from %s", r.RemoteAddr)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("[Webhook] Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	// Get the signature from header
	signature := r.Header.Get("x-signature")
	if signature == "" {
		log.Printf("[Webhook] Missing signature in request headers")
		http.Error(w, "Missing signature", http.StatusBadRequest)
		return
	}

	// Validate signature
	if !validateWebhookSignature(body, signature, os.Getenv("LEMON_SQUEEZY_SIGNING_SECRET")) {
		log.Printf("[Webhook] Invalid signature received")
		http.Error(w, "Invalid signature", http.StatusForbidden)
		return
	}

	log.Printf("[Webhook] Signature validation successful")

	// Parse the payload
	var payload WebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		log.Printf("[Webhook] Failed to parse payload: %v", err)
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// Parse attributes based on event type
	var orderAttrs OrderAttributes
	var subscriptionAttrs SubscriptionAttributes
	var err2 error

	// Convert attributes to appropriate type based on event
	switch payload.Meta.EventName {
	case "order_created", "order_refunded":
		attrsBytes, err := json.Marshal(payload.Data.Attributes)
		if err != nil {
			log.Printf("[Webhook] Error marshaling attributes: %v", err)
			http.Error(w, "Invalid payload attributes", http.StatusBadRequest)
			return
		}
		if err := json.Unmarshal(attrsBytes, &orderAttrs); err != nil {
			log.Printf("[Webhook] Error unmarshaling order attributes: %v", err)
			http.Error(w, "Invalid payload attributes", http.StatusBadRequest)
			return
		}
	default:
		attrsBytes, err := json.Marshal(payload.Data.Attributes)
		if err != nil {
			log.Printf("[Webhook] Error marshaling attributes: %v", err)
			http.Error(w, "Invalid payload attributes", http.StatusBadRequest)
			return
		}
		if err := json.Unmarshal(attrsBytes, &subscriptionAttrs); err != nil {
			log.Printf("[Webhook] Error unmarshaling subscription attributes: %v", err)
			http.Error(w, "Invalid payload attributes", http.StatusBadRequest)
			return
		}
	}

	log.Printf("[Webhook] Event: %s", payload.Meta.EventName)

	// Handle different webhook events
	switch payload.Meta.EventName {
	case "order_created":
		log.Printf("[Webhook] Processing order creation")
		if len(payload.Meta.CustomData) == 0 {
			log.Printf("[Webhook] Error: No user ID provided in CustomData")
			http.Error(w, "Missing user ID in CustomData", http.StatusBadRequest)
			return
		}
		err2 = h.DB.CreateOrder(
			payload.Meta.CustomData["user_id"],
			orderAttrs.OrderID,
			orderAttrs.CustomerID,
			orderAttrs.FirstOrderItem.ProductID,
			orderAttrs.FirstOrderItem.VariantID,
			orderAttrs.Status,
			orderAttrs.SubtotalFormatted,
			orderAttrs.TaxFormatted,
			orderAttrs.TotalFormatted,
			orderAttrs.TaxInclusive,
		)
		log.Printf("[Webhook] Processed order creation")

	case "order_refunded":
		log.Printf("[Webhook] Processing order refund")
		err2 = h.DB.UpdateOrderRefund(
			orderAttrs.OrderID,
			orderAttrs.RefundedAt,
			orderAttrs.RefundedAmountFormatted,
		)
		if err2 == nil && len(payload.Meta.CustomData) > 0 {
			// Invalidate user cache after refund
			h.DB.InvalidateUserCache(payload.Meta.CustomData["user_id"])
		}
		log.Printf("[Webhook] Processed order refund")

	case "subscription_created":
		log.Printf("[Webhook] Processing subscription creation")
		if len(payload.Meta.CustomData) == 0 {
			log.Printf("[Webhook] Error: No user ID provided in CustomData")
			http.Error(w, "Missing user ID in CustomData", http.StatusBadRequest)
			return
		}

		subscriptionID, err := strconv.Atoi(payload.Data.ID)
		if err != nil {
			log.Printf("[Webhook] Error converting subscription ID: %v", err)
			http.Error(w, "Invalid subscription ID", http.StatusBadRequest)
			return
		}

		// Parse user ID as UUID
		userID := payload.Meta.CustomData["user_id"]
		if _, err := uuid.Parse(userID); err != nil {
			log.Printf("[Webhook] Error: Invalid UUID format for user ID: %v", err)
			http.Error(w, "Invalid user ID format", http.StatusBadRequest)
			return
		}

		err2 = h.DB.CreateSubscription(
			userID,
			subscriptionID,
			subscriptionAttrs.OrderID,
			subscriptionAttrs.CustomerID,
			subscriptionAttrs.ProductID,
			subscriptionAttrs.VariantID,
			subscriptionAttrs.Status,
			subscriptionAttrs.RenewsAt,
			subscriptionAttrs.EndsAt,
			subscriptionAttrs.TrialEndsAt,
		)
		if err2 != nil {
			log.Printf("[Webhook] Error creating subscription: %v", err2)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		err2 = h.DB.UpdateUserSubscription(
			userID,
			subscriptionID,
			subscriptionAttrs.Status,
			subscriptionAttrs.ProductID,
			subscriptionAttrs.VariantID,
			subscriptionAttrs.RenewsAt,
			subscriptionAttrs.EndsAt,
		)
		if err2 != nil {
			log.Printf("[Webhook] Error updating user subscription: %v", err2)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Invalidate user cache after subscription creation
		h.DB.InvalidateUserCache(userID)
		log.Printf("[Webhook] Successfully processed subscription creation and invalidated cache")

	case "subscription_updated",
		"subscription_payment_success",
		"subscription_payment_recovered",
		"subscription_plan_changed",
		"subscription_paused",
		"subscription_cancelled",
		"subscription_expired",
		"subscription_unpaused",
		"subscription_resumed",
		"subscription_payment_failed",
		"subscription_payment_refunded":
		log.Printf("[Webhook] Processing subscription event: %s", payload.Meta.EventName)

		subscriptionID, err := strconv.Atoi(payload.Data.ID)
		if err != nil {
			log.Printf("[Webhook] Error converting subscription ID: %v", err)
			http.Error(w, "Invalid subscription ID", http.StatusBadRequest)
			return
		}

		// Determine subscription status and cancellation state based on event type
		status := subscriptionAttrs.Status
		cancelled := subscriptionAttrs.Cancelled

		switch payload.Meta.EventName {
		case "subscription_cancelled", "subscription_expired":
			cancelled = true
		case "subscription_unpaused", "subscription_resumed":
			status = "active"
			cancelled = false
		case "subscription_payment_failed":
			status = "failed"
			cancelled = false
		case "subscription_payment_refunded":
			status = "refunded"
			cancelled = false
		case "subscription_paused":
			status = "pause"
			cancelled = false
		}

		err2 = h.DB.UpdateSubscription(
			subscriptionID,
			status,
			cancelled,
			subscriptionAttrs.ProductID,
			subscriptionAttrs.VariantID,
			subscriptionAttrs.RenewsAt,
			subscriptionAttrs.EndsAt,
			subscriptionAttrs.TrialEndsAt,
		)
		if err2 != nil {
			log.Printf("[Webhook] Error updating subscription: %v", err2)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Update user's subscription details
		if len(payload.Meta.CustomData) > 0 {
			userID := payload.Meta.CustomData["user_id"]
			log.Printf("[Webhook] Updating user subscription details - UserID: %s", userID)
			err2 = h.DB.UpdateUserSubscription(
				userID,
				subscriptionID,
				status,
				subscriptionAttrs.ProductID,
				subscriptionAttrs.VariantID,
				subscriptionAttrs.RenewsAt,
				subscriptionAttrs.EndsAt,
			)
			if err2 != nil {
				log.Printf("[Webhook] Error updating user subscription: %v", err2)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			// Invalidate user cache after subscription update
			h.DB.InvalidateUserCache(userID)
			log.Printf("[Webhook] Successfully updated user subscription details and invalidated cache")
		} else {
			log.Printf("[Webhook] Skipping user subscription update - no user_id in CustomData")
		}
		log.Printf("[Webhook] Processed subscription event: %s", payload.Meta.EventName)

	default:
		log.Printf("[Webhook] Unhandled event type: %s", payload.Meta.EventName)
		w.WriteHeader(http.StatusOK)
		return
	}

	if err2 != nil {
		log.Printf("[Webhook] Error processing webhook: %v", err2)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
