// Package handlers provides helper functions for authentication and token management
package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"saas-server/middleware"
	"saas-server/models"
)

// Common response types
type ErrorResponse struct {
	Error string `json:"error"`
}

type SuccessResponse struct {
	Message string `json:"message"`
}

// Token generation helpers
type TokenPair struct {
	AccessToken  string
	RefreshToken string
	AccessJTI    string
	RefreshJTI   string
	ExpiresAt    time.Time
}

// UpdateProfileRequest represents the request body for profile update endpoint
type UpdateProfileRequest struct {
	Name  string `json:"name"`  // New display name
	Email string `json:"email"` // New email address
}

// UpdateProfile handles user profile update endpoint (PUT /user/profile)
// It requires authentication and updates the user's profile information
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		log.Printf("[Auth] Method not allowed: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		log.Printf("[Auth] Unauthorized request to update profile")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[Auth] Invalid request body for profile update: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("[Auth] Updating profile for user: %s", userID)
	if err := h.db.UpdateUser(userID, req.Name, req.Email); err != nil {
		log.Printf("[Auth] Failed to update profile: %v", err)
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	user, err := h.db.GetUserByID(userID)
	if err != nil {
		log.Printf("[Auth] Failed to get updated user: %v", err)
		http.Error(w, "Failed to get updated user", http.StatusInternalServerError)
		return
	}

	log.Printf("[Auth] Profile updated successfully for user: %s", userID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	})
}

// Token generation helpers
func (h *AuthHandler) generateTokenPair(userID string) (*TokenPair, error) {
	accessExp := time.Now().Add(5 * time.Minute)
	refreshExp := time.Now().Add(7 * 24 * time.Hour)

	// Generate JTIs
	accessJTI := uuid.New().String()
	refreshJTI := uuid.New().String()

	// Create access token
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"exp":  accessExp.Unix(),
		"jti":  accessJTI,
		"type": "access",
	})

	accessTokenString, err := accessToken.SignedString(h.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("error generating access token: %w", err)
	}

	// Create refresh token
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"exp":  refreshExp.Unix(),
		"jti":  refreshJTI,
		"type": "refresh",
	})

	refreshTokenString, err := refreshToken.SignedString(h.jwtRefreshSecret)
	if err != nil {
		return nil, fmt.Errorf("error generating refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		AccessJTI:    accessJTI,
		RefreshJTI:   refreshJTI,
		ExpiresAt:    refreshExp,
	}, nil
}

// Cookie management helpers
func (h *AuthHandler) setAuthCookies(w http.ResponseWriter, tokens *TokenPair) {
	// Set access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    tokens.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  tokens.ExpiresAt,
	})

	// Set refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		Path:     "/auth/refresh",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  tokens.ExpiresAt,
	})

	// Set CSRF token cookie
	csrfToken := uuid.New().String()
	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_token",
		Value:    csrfToken,
		Path:     "/",
		HttpOnly: false,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  tokens.ExpiresAt,
	})
}

// Clear all auth cookies
func (h *AuthHandler) clearAuthCookies(w http.ResponseWriter) {
	expiredTime := time.Now().Add(-1 * time.Hour)

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  expiredTime,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/auth/refresh",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  expiredTime,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_token",
		Value:    "",
		Path:     "/",
		HttpOnly: false,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  expiredTime,
	})
}

// Response helpers
func sendJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func sendErrorResponse(w http.ResponseWriter, status int, message string) {
	sendJSONResponse(w, status, ErrorResponse{Error: message})
}

func sendSuccessResponse(w http.ResponseWriter, message string) {
	sendJSONResponse(w, http.StatusOK, SuccessResponse{Message: message})
}

// Auth response helper
func (h *AuthHandler) sendAuthResponse(w http.ResponseWriter, user *models.User) {
	response := AuthResponse{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		EmailVerified: user.EmailVerified,
	}
	sendJSONResponse(w, http.StatusOK, response)
}

// Token validation and blacklisting helpers
func (h *AuthHandler) validateAndBlacklistToken(tokenString string) (*jwt.Token, error) {
	token, err := h.validateToken(tokenString)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	jti, ok := claims["jti"].(string)
	if !ok {
		return nil, fmt.Errorf("missing jti claim")
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return nil, fmt.Errorf("missing sub claim")
	}

	exp, ok := claims["exp"].(float64)
	if !ok {
		return nil, fmt.Errorf("missing exp claim")
	}

	if err := h.db.AddToBlacklist(jti, userID, time.Unix(int64(exp), 0)); err != nil {
		return nil, fmt.Errorf("error blacklisting token: %w", err)
	}

	return token, nil
}

// validateToken validates a JWT token and returns the parsed token if valid
func (h *AuthHandler) validateToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return h.jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("error parsing token: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		jti, ok1 := claims["jti"].(string)
		if !ok1 {
			return nil, fmt.Errorf("missing jti claim")
		}

		blacklisted, err := h.db.IsTokenBlacklisted(jti)
		if err != nil {
			return nil, fmt.Errorf("error checking token blacklist: %w", err)
		}

		if blacklisted {
			return nil, fmt.Errorf("token is blacklisted")
		}
	}

	return token, nil
}

// Password validation helper
func validatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}
	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}
	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}
	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		return fmt.Errorf("password must contain at least one number")
	}
	if !regexp.MustCompile(`[^A-Za-z0-9]`).MatchString(password) {
		return fmt.Errorf("password must contain at least one special character")
	}
	return nil
}

// Device info helper
func getDeviceInfo(r *http.Request) (string, string) {
	userAgent := r.Header.Get("User-Agent")
	ipAddress := r.Header.Get("X-Forwarded-For")
	if ipAddress == "" {
		ipAddress = r.RemoteAddr
	}
	return userAgent, ipAddress
}

// Token validation helpers
func (h *AuthHandler) validateRefreshToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return h.jwtRefreshSecret, nil
	})

	if err != nil {
		return "", fmt.Errorf("error parsing refresh token: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", fmt.Errorf("invalid refresh token claims")
	}

	// Extract JTI and verify token in database
	jti, ok := claims["jti"].(string)
	if !ok {
		return "", fmt.Errorf("missing jti claim")
	}

	// Verify refresh token in database using the JTI
	storedToken, err := h.db.GetRefreshToken(jti)
	if err != nil {
		return "", fmt.Errorf("error verifying refresh token: %w", err)
	}

	if storedToken == nil {
		return "", fmt.Errorf("refresh token not found")
	}

	return storedToken.UserID, nil
}

// checkCSRFToken validates the CSRF token from request header against the cookie
func checkCSRFToken(r *http.Request) error {
	csrfToken := r.Header.Get("X-CSRF-Token")
	csrfCookie, err := r.Cookie("csrf_token")
	if err != nil || csrfToken == "" || csrfToken != csrfCookie.Value {
		return fmt.Errorf("invalid CSRF token")
	}
	return nil
}

// createRateLimitedHandler creates a rate-limited version of the given handler
func createRateLimitedHandler(duration time.Duration, limit int, handler http.HandlerFunc) http.HandlerFunc {
	limiter := middleware.NewRateLimiter(duration, limit)
	return limiter.Limit(handler).ServeHTTP
}

// GenerateAuthResponse handles the common flow of generating tokens, storing refresh token,
// setting cookies, and sending the auth response
func (h *AuthHandler) GenerateAuthResponse(w http.ResponseWriter, r *http.Request, user *models.User) error {
	// Generate tokens
	tokens, err := h.generateTokenPair(user.ID)
	if err != nil {
		return fmt.Errorf("error generating tokens: %w", err)
	}

	// Get device info
	userAgent, ipAddress := getDeviceInfo(r)

	// Store refresh token
	if err := h.db.CreateRefreshToken(user.ID, tokens.RefreshJTI, userAgent, ipAddress, tokens.ExpiresAt); err != nil {
		return fmt.Errorf("error storing refresh token: %w", err)
	}

	// Set cookies
	h.setAuthCookies(w, tokens)

	// Send response
	h.sendAuthResponse(w, user)
	return nil
}

// Track user signup with Plunk
func trackUserSignup(email string, name string) error {
	plunkAPIKey := os.Getenv("PLUNK_SECRET_API_KEY")
	if plunkAPIKey == "" {
		return fmt.Errorf("PLUNK_SECRET_API_KEY not set")
	}

	type UserData struct {
		Name string `json:"name"`
	}

	type TrackRequest struct {
		Event     string   `json:"event"`
		Email     string   `json:"email"`
		Subscribed bool     `json:"subscribed"` // Added subscribed field
		Data      UserData `json:"data"`
	}

	trackReq := TrackRequest{
		Event:     "user-signup",
		Email:     email,
		Subscribed: true, // Set subscribed to true
		Data: UserData{
			Name: name,
		},
	}

	jsonData, err := json.Marshal(trackReq)
	if err != nil {
		return fmt.Errorf("error marshaling track request: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.useplunk.com/v1/track", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+plunkAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error tracking signup: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error response from Plunk API: %d", resp.StatusCode)
	}

	return nil
}
