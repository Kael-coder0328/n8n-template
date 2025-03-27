// Package handlers provides HTTP request handlers for the SaaS platform's API endpoints.
// It includes authentication, user management, and other core functionality handlers.
package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	goauth "golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	googleauth "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"

	"saas-server/database"
	"saas-server/middleware"
	"saas-server/models"

	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db                 database.DBInterface
	jwtSecret          []byte
	jwtRefreshSecret   []byte
	authLimiter        *middleware.RateLimiter
	googleClientID     string
	googleClientSecret string
	googleRedirectURL  string
	githubClientID     string
	githubClientSecret string
	githubRedirectURL  string
}

// AuthResponse represents the response body for successful authentication operations
type AuthResponse struct {
	ID            string `json:"id"`             // User's unique identifier
	Name          string `json:"name"`           // User's display name
	Email         string `json:"email"`          // User's email address
	EmailVerified bool   `json:"email_verified"` // Whether user's email is verified
}

// AuthHandler handles authentication-related HTTP requests and manages user sessions
// GoogleAuthRequest represents the request body for Google OAuth authentication
type GoogleAuthRequest struct {
	Code string `json:"code"` // Authorization code from Google OAuth
}

// RegisterRequest represents the request body for user registration endpoint
type RegisterRequest struct {
	Name     string `json:"name"`     // User's display name
	Email    string `json:"email"`    // User's email address
	Password string `json:"password"` // User's chosen password
}

// LoginRequest represents the request body for user login endpoint
type LoginRequest struct {
	Email    string `json:"email"`    // User's email address
	Password string `json:"password"` // User's password
}

// AccountPasswordResetRequest represents the request body for account password reset endpoint
type AccountPasswordResetRequest struct {
	CurrentPassword string `json:"currentPassword"` // User's current password
	NewPassword     string `json:"newPassword"`     // User's new password
}

// RequestPasswordResetRequest represents the request body for password reset request
type RequestPasswordResetRequest struct {
	Email string `json:"email"` // User's email address
}

// ResetPasswordRequest represents the request body for password reset
type ResetPasswordRequest struct {
	Token       string `json:"token"`    // Password reset token
	NewPassword string `json:"password"` // New password to set
}

// Cache for subscription status to reduce database load
var (
	subscriptionCache = make(map[string]*models.UserSubscriptionStatus)
	cacheMutex        sync.RWMutex
	cacheExpiry       = 5 * time.Minute
)

// GithubAuthRequest represents the request body for GitHub OAuth authentication
type GithubAuthRequest struct {
	Code string `json:"code"` // Authorization code from GitHub OAuth
}

// NewAuthHandler creates a new AuthHandler instance with the given database connection and JWT secret
func NewAuthHandler(db database.DBInterface, jwtSecret string) *AuthHandler {
	// Create rate limiter for auth endpoints - 5 attempts per minute
	authLimiter := middleware.NewRateLimiter(time.Minute, 5)

	return &AuthHandler{
		db:                 db,
		jwtSecret:          []byte(jwtSecret),
		jwtRefreshSecret:   []byte(jwtSecret), // Using same secret for now, could be different in production
		authLimiter:        authLimiter,
		googleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		googleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		googleRedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		githubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		githubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		githubRedirectURL:  os.Getenv("GITHUB_REDIRECT_URL"),
	}
}

func (h *AuthHandler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req GoogleAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[Auth] Error decoding request body: %v", err)
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Initialize OAuth2 config
	config := &goauth.Config{
		ClientID:     h.googleClientID,
		ClientSecret: h.googleClientSecret,
		RedirectURL:  h.googleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	// Exchange authorization code for token
	token, err := config.Exchange(context.Background(), req.Code)
	log.Printf("[Auth] Exchanging code with redirect URI: %s", config.RedirectURL)
	if err != nil {
		log.Printf("[Auth] Failed to exchange auth code: %v", err)
		sendErrorResponse(w, http.StatusUnauthorized, "Failed to authenticate with Google")
		return
	}

	// Get user info using oauth2 service
	oauth2Service, err := googleauth.NewService(context.Background(), option.WithTokenSource(config.TokenSource(context.Background(), token)))
	if err != nil {
		log.Printf("[Auth] Failed to create OAuth2 service: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to verify Google credentials")
		return
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		log.Printf("[Auth] Failed to get user info: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user information")
		return
	}

	// Verify the user exists or create a new one
	user, err := h.db.GetUserByEmail(userInfo.Email)
	if err != nil {
		if err == database.ErrNotFound || err.Error() == "sql: no rows in result set" {
			// Create new user with Google provider and verified email
			user, err = h.db.CreateUser(userInfo.Email, "", userInfo.Name, true)
			if err != nil {
				log.Printf("[Auth] Failed to create user: %v", err)
				sendErrorResponse(w, http.StatusInternalServerError, "Failed to create user")
				return
			}

			// Track user signup with Plunk for new users
			if err := trackUserSignup(user.Email, user.Name); err != nil {
				log.Printf("[Auth] Error tracking user signup: %v", err)
				// Continue even if tracking fails
			}
		} else {
			log.Printf("[Auth] Database error while checking user: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Internal server error")
			return
		}
	}

	if err := h.GenerateAuthResponse(w, r, user); err != nil {
		log.Printf("[Auth] Error generating auth response: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Error processing Google authentication")
		return
	}
}

// Register handles user registration endpoint (POST /auth/register)
// It validates the request, checks for existing users, and creates a new user account
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}
	if req.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	// Validate password strength
	if err := validatePassword(req.Password); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Check if user already exists
	existingUser, err := h.db.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[Auth] Error hashing password: %v", err)
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	// Create new user with email_verified set to false for regular registration
	user, err := h.db.CreateUser(req.Email, string(hashedPassword), req.Name, false)
	if err != nil {
		log.Printf("[Auth] Error creating user: %v", err)
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	// Track user signup with Plunk
	if err := trackUserSignup(user.Email, user.Name); err != nil {
		log.Printf("[Auth] Error tracking user signup: %v", err)
		// Continue even if tracking fails
	}

	// Send success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User registered successfully",
		"id":      user.ID,
	})
}

// Login handles user authentication endpoint (POST /auth/login)
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Email == "" {
		sendErrorResponse(w, http.StatusBadRequest, "Email is required")
		return
	}

	if req.Password == "" {
		sendErrorResponse(w, http.StatusBadRequest, "Password is required")
		return
	}

	user, err := h.db.GetUserByEmail(req.Email)
	if err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	if err := h.GenerateAuthResponse(w, r, user); err != nil {
		log.Printf("[Auth] Error generating auth response: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Error processing login")
		return
	}
}

// RefreshToken handles token refresh endpoint (POST /auth/refresh)
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	refreshHandler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			sendErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		// Try to blacklist old access token if present
		if accessCookie, err := r.Cookie("access_token"); err == nil && accessCookie.Value != "" {
			if _, err := h.validateAndBlacklistToken(accessCookie.Value); err != nil {
				log.Printf("[Auth] Error blacklisting old access token: %v", err)
				// Continue even if blacklisting fails
			}
		}

		// Get refresh token from cookie
		cookie, err := r.Cookie("refresh_token")
		if err != nil {
			sendErrorResponse(w, http.StatusUnauthorized, "Refresh token not found")
			return
		}

		// Validate CSRF token
		if err := checkCSRFToken(r); err != nil {
			log.Printf("[Auth] CSRF validation failed: %v", err)
			sendErrorResponse(w, http.StatusUnauthorized, "Invalid CSRF token")
			return
		}

		// Validate refresh token and get user ID
		userID, err := h.validateRefreshToken(cookie.Value)
		if err != nil {
			log.Printf("[Auth] Refresh token validation failed: %v", err)
			sendErrorResponse(w, http.StatusUnauthorized, "Invalid refresh token")
			return
		}

		// Get user details
		user, err := h.db.GetUserByID(userID)
		if err != nil {
			log.Printf("[Auth] Error fetching user details: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Error fetching user details")
			return
		}

		if err := h.GenerateAuthResponse(w, r, user); err != nil {
			log.Printf("[Auth] Error generating auth response: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Error processing token refresh")
			return
		}
	}

	// Apply rate limiting - 3 attempts per 5 minutes
	handler := createRateLimitedHandler(5*time.Minute, 3, refreshHandler)
	handler(w, r)
}

// Logout handles user logout by blacklisting the current token and invalidating refresh tokens
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Get access token from cookie
	accessCookie, err := r.Cookie("access_token")
	if err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Access token not found")
		return
	}

	// Validate and blacklist token
	token, err := h.validateAndBlacklistToken(accessCookie.Value)
	if err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	// Extract user ID and invalidate refresh tokens
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := claims["sub"].(string)
		if err := h.db.DeleteAllUserRefreshTokens(userID); err != nil {
			log.Printf("[Auth] Error invalidating refresh tokens: %v", err)
		}
	}

	// Clear cookies
	h.clearAuthCookies(w)

	// Send success response
	sendSuccessResponse(w, "Successfully logged out")
}

// RequestPasswordReset handles password reset request endpoint (POST /auth/reset-password/request)
func (h *AuthHandler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RequestPasswordResetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user by email
	user, err := h.db.GetUserByEmail(req.Email)
	if err != nil {
		// Don't reveal whether the email exists
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "If your email is registered, you will receive a password reset link",
		})
		return
	}

	// Generate reset token
	token := uuid.New().String()
	expiresAt := time.Now().Add(1 * time.Hour)

	// Save reset token
	if err := h.db.CreatePasswordResetToken(user.ID, token, expiresAt); err != nil {
		http.Error(w, "Error creating password reset token", http.StatusInternalServerError)
		return
	}

	// Send email with reset link
	resetLink := fmt.Sprintf("%s/auth/reset-password?token=%s", os.Getenv("FRONTEND_URL"), token)
	if err := sendPasswordResetEmail(user.Email, resetLink); err != nil {
		log.Printf("[Auth] Error sending password reset email: %v", err)
		// Don't expose the error to the client for security
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "If your email is registered, you will receive a password reset link",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "If your email is registered, you will receive a password reset link",
	})
}

// ResetPassword handles password reset endpoint (POST /auth/reset-password)
func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate password strength
	if err := validatePassword(req.NewPassword); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user ID from reset token
	userID, err := h.db.GetPasswordResetToken(req.Token)
	if err != nil {
		http.Error(w, "Invalid or expired reset token", http.StatusBadRequest)
		return
	}

	// Mark token as used
	if err := h.db.MarkPasswordResetTokenUsed(req.Token); err != nil {
		http.Error(w, "Token has already been used", http.StatusBadRequest)
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Update password
	if err := h.db.UpdatePassword(userID, string(hashedPassword)); err != nil {
		http.Error(w, "Error updating password", http.StatusInternalServerError)
		return
	}

	// Invalidate all refresh tokens for this user
	if err := h.db.DeleteAllUserRefreshTokens(userID); err != nil {
		log.Printf("[Auth] Error invalidating refresh tokens: %v", err)
		// Don't return error here as the password is already updated
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password updated successfully. Please log in again with your new password.",
	})
}

// AccountPasswordReset handles password reset for authenticated users
func (h *AuthHandler) AccountPasswordReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("[Auth] Method not allowed: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		log.Printf("[Auth] Unauthorized request to reset password")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req AccountPasswordResetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[Auth] Invalid request body for password reset: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate new password strength
	if err := validatePassword(req.NewPassword); err != nil {
		log.Printf("[Auth] Invalid new password: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user from database
	user, err := h.db.GetUserByID(userID)
	if err != nil {
		log.Printf("[Auth] User not found: %v", err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		log.Printf("[Auth] Current password is incorrect for user: %s", userID)
		http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[Auth] Failed to hash password: %v", err)
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Update password in database
	if err := h.db.UpdatePassword(userID, string(hashedPassword)); err != nil {
		log.Printf("[Auth] Failed to update password: %v", err)
		http.Error(w, "Error updating password", http.StatusInternalServerError)
		return
	}

	// Invalidate all refresh tokens for this user
	if err := h.db.DeleteAllUserRefreshTokens(userID); err != nil {
		log.Printf("[Auth] Error invalidating refresh tokens: %v", err)
		// Don't return error here as the password is already updated
	}

	log.Printf("[Auth] Password reset successful for user: %s", userID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password updated successfully.",
	})
}

// VerifyUser returns the user's subscription status and product details
func (h *AuthHandler) VerifyUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
	return
	}

	// Try to get status from cache first
	cacheMutex.RLock()
	if status, exists := subscriptionCache[userID]; exists {
		cacheMutex.RUnlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(status)
		return
	}
	cacheMutex.RUnlock()

	// Create a channel for the database response
	statusChan := make(chan *models.UserSubscriptionStatus, 1)
	errChan := make(chan error, 1)

	// Query database in a goroutine
	go func() {
		status, err := h.db.GetUserSubscriptionStatus(userID)
		if err != nil {
			errChan <- err
			return
		}
		statusChan <- status

		// Update cache in background
		cacheMutex.Lock()
		subscriptionCache[userID] = status
		cacheMutex.Unlock()

		// Set up cache expiry
		time.AfterFunc(cacheExpiry, func() {
			cacheMutex.Lock()
			delete(subscriptionCache, userID)
			cacheMutex.Unlock()
		})
	}()

	// Wait for result with timeout
	select {
	case status := <-statusChan:
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(status)
	case err := <-errChan:
		log.Printf("[Auth] Error getting subscription status: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	case <-time.After(5 * time.Second):
		log.Printf("[Auth] Timeout getting subscription status for user: %s", userID)
		http.Error(w, "Request timeout", http.StatusGatewayTimeout)
	}
}

func (h *AuthHandler) GithubAuth(w http.ResponseWriter, r *http.Request) {
	var req GithubAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[Auth] Error decoding request body: %v", err)
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Initialize OAuth2 config
	config := &goauth.Config{
		ClientID:     h.githubClientID,
		ClientSecret: h.githubClientSecret,
		RedirectURL:  h.githubRedirectURL,
		Scopes: []string{
			"read:user",
			"user:email",
		},
		Endpoint: goauth.Endpoint{
			AuthURL:  "https://github.com/login/oauth/authorize",
			TokenURL: "https://github.com/login/oauth/access_token",
		},
	}

	// Exchange authorization code for token
	token, err := config.Exchange(context.Background(), req.Code)
	if err != nil {
		log.Printf("[Auth] Failed to exchange auth code: %v", err)
		sendErrorResponse(w, http.StatusUnauthorized, "Failed to authenticate with GitHub")
		return
	}

	// Get user info from GitHub API
	client := &http.Client{}
	userReq, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		log.Printf("[Auth] Failed to create GitHub API request: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user information")
		return
	}
	userReq.Header.Set("Authorization", "Bearer "+token.AccessToken)
	userReq.Header.Set("Accept", "application/json")

	resp, err := client.Do(userReq)
	if err != nil {
		log.Printf("[Auth] Failed to get user info from GitHub: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user information")
		return
	}
	defer resp.Body.Close()

	var githubUser struct {
		ID    int    `json:"id"`
		Login string `json:"login"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&githubUser); err != nil {
		log.Printf("[Auth] Failed to decode GitHub user info: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user information")
		return
	}

	// If email is not public, fetch user's primary email
	if githubUser.Email == "" {
		emailReq, err := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
		if err != nil {
			log.Printf("[Auth] Failed to create GitHub emails request: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user email")
			return
		}
		emailReq.Header.Set("Authorization", "Bearer "+token.AccessToken)
		emailReq.Header.Set("Accept", "application/json")

		emailResp, err := client.Do(emailReq)
		if err != nil {
			log.Printf("[Auth] Failed to get user emails from GitHub: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user email")
			return
		}
		defer emailResp.Body.Close()

		// Read the response body for debugging
		body, err := io.ReadAll(emailResp.Body)
		if err != nil {
			log.Printf("[Auth] Failed to read email response body: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user email")
			return
		}
		log.Printf("[Auth] GitHub email response: %s", string(body))

		// Parse the email response
		var emailsResponse []struct {
			Email      string      `json:"email"`
			Primary    bool        `json:"primary"`
			Verified   bool        `json:"verified"`
			Visibility interface{} `json:"visibility"`
		}

		if err := json.Unmarshal(body, &emailsResponse); err != nil {
			log.Printf("[Auth] Failed to decode GitHub emails: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Failed to get user email")
			return
		}

		// Find primary email
		for _, email := range emailsResponse {
			if email.Primary && email.Verified {
				githubUser.Email = email.Email
				break
			}
		}

		if githubUser.Email == "" {
			log.Printf("[Auth] No primary email found for GitHub user")
			sendErrorResponse(w, http.StatusInternalServerError, "No valid email found")
			return
		}
	}

	// Use login as name if name is not set
	if githubUser.Name == "" {
		githubUser.Name = githubUser.Login
	}

	// Verify the user exists or create a new one
	user, err := h.db.GetUserByEmail(githubUser.Email)
	if err != nil {
		if err == database.ErrNotFound || err.Error() == "sql: no rows in result set" {

			// Create new user with email_verified set to true for GitHub auth
			user, err = h.db.CreateUser(githubUser.Email, "", githubUser.Name, true)
			if err != nil {
				log.Printf("[Auth] Failed to create user: %v", err)
				sendErrorResponse(w, http.StatusInternalServerError, "Failed to create user")
				return
			}

			// Track user signup with Plunk for new users
			if err := trackUserSignup(user.Email, user.Name); err != nil {
				log.Printf("[Auth] Error tracking user signup: %v", err)
				// Continue even if tracking fails
			}
		} else {
			log.Printf("[Auth] Database error while checking user: %v", err)
			sendErrorResponse(w, http.StatusInternalServerError, "Internal server error")
			return
		}
	} else {
		log.Printf("[Auth] Found existing user with ID: %s, Email: %s", user.ID, user.Email)
	}

	// Log the final user state before generating response
	log.Printf("[Auth] Final user state - ID: %s, Email: %s, Name: %s, EmailVerified: %v",
		user.ID, user.Email, user.Name, user.EmailVerified)

	if err := h.GenerateAuthResponse(w, r, user); err != nil {
		log.Printf("[Auth] Error generating auth response: %v", err)
		sendErrorResponse(w, http.StatusInternalServerError, "Error processing GitHub authentication")
		return
	}
}
