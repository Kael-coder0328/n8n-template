package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"saas-server/middleware"
	"time"

	"github.com/google/uuid"
)

// EmailVerificationToken represents a token for email verification
type EmailVerificationToken struct {
	Token     string    `json:"token"`
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
}

func (h *AuthHandler) SendVerificationEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context using the correct key
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		log.Printf("Error: user_id not found in context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get user details
	user, err := h.db.GetUserByID(userID)
	if err != nil {
		log.Printf("Error getting user: %v", err)
		http.Error(w, "Error getting user details", http.StatusInternalServerError)
		return
	}

	// Check if email is already verified
	if user.EmailVerified {
		http.Error(w, "Email is already verified", http.StatusBadRequest)
		return
	}

	// Generate verification token
	token := uuid.New().String()
	expiresAt := time.Now().Add(24 * time.Hour)

	// Store verification token in database
	err = h.db.StoreEmailVerificationToken(token, userID, user.Email, expiresAt)
	if err != nil {
		log.Printf("Error storing verification token: %v", err)
		http.Error(w, "Error generating verification token", http.StatusInternalServerError)
		return
	}

	// Generate verification link
	clientURL := os.Getenv("FRONTEND_URL")
	if clientURL == "" {
		clientURL = "http://localhost:3000" // Default for development
	}
	verificationLink := fmt.Sprintf("%s/auth/verify-email?token=%s", clientURL, token)

	// Send verification email
	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.button {
					display: inline-block;
					padding: 12px 24px;
					background-color: #3b82f6;
					color: white;
					text-decoration: none;
					border-radius: 6px;
					margin: 20px 0;
				}
				.footer { margin-top: 30px; font-size: 14px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Verify Your Email Address</h2>
				<p>Thank you for signing up! Please click the button below to verify your email address:</p>
				
				<a href="%s" class="button">Verify Email</a>
				
				<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
				<p>%s</p>
				
				<div class="footer">
					<p>This link will expire in 24 hours for security reasons.</p>
					<p>If you didn't create an account, you can safely ignore this email.</p>
				</div>
			</div>
		</body>
		</html>
	`, verificationLink, verificationLink)

	emailReq := PlunkEmailRequest{
		To:      user.Email,
		Subject: "Verify Your Email Address",
		Body:    htmlBody,
	}

	// Send email using Plunk
	jsonData, err := json.Marshal(emailReq)
	if err != nil {
		log.Printf("Error marshaling email request: %v", err)
		http.Error(w, "Error sending verification email", http.StatusInternalServerError)
		return
	}

	plunkAPIKey := os.Getenv("PLUNK_SECRET_API_KEY")
	if plunkAPIKey == "" {
		log.Printf("PLUNK_SECRET_API_KEY not set")
		http.Error(w, "Error sending verification email", http.StatusInternalServerError)
		return
	}

	req, err := http.NewRequest("POST", "https://api.useplunk.com/v1/send", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error creating request: %v", err)
		http.Error(w, "Error sending verification email", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+plunkAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending email: %v", err)
		http.Error(w, "Error sending verification email", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Error response from Plunk API: %d", resp.StatusCode)
		http.Error(w, "Error sending verification email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Verification email sent successfully",
	})
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	log.Printf("[Email Verification] Request received - Method: %s", r.Method)

	if r.Method != http.MethodPost {
		log.Printf("[Email Verification] Invalid method: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[Email Verification] Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("[Email Verification] Processing token: %s", req.Token)

	if req.Token == "" {
		log.Printf("[Email Verification] Empty token received")
		http.Error(w, "Missing verification token", http.StatusBadRequest)
		return
	}

	// Verify token and update user's email verification status
	err := h.db.VerifyEmail(req.Token)
	if err != nil {
		log.Printf("[Email Verification] Token verification failed: %v", err)
		http.Error(w, "Invalid or expired verification token", http.StatusBadRequest)
		return
	}

	log.Printf("[Email Verification] Email verified successfully for token: %s", req.Token)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Email verified successfully",
	})
}
