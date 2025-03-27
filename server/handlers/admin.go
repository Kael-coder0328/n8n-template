package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"saas-server/database"
	"saas-server/models"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AdminHandler struct {
	db database.DBInterface
}

func NewAdminHandler(db database.DBInterface) *AdminHandler {
	return &AdminHandler{
		db: db,
	}
}

type AdminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AdminLoginResponse struct {
	Token string `json:"token"`
}

type GetUsersResponse struct {
	Users []models.User `json:"users"`
	Total int           `json:"total"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
}

func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AdminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate admin credentials
	if req.Username != os.Getenv("ADMIN_USERNAME") || req.Password != os.Getenv("ADMIN_PASSWORD") {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  "admin",
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
		"role": "admin",
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("ADMIN_JWT_SECRET")))
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AdminLoginResponse{Token: tokenString})
}

func (h *AdminHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get query parameters with defaults
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 20 // Default limit
	}

	search := r.URL.Query().Get("search")

	// Get users from database
	users, total, err := h.db.GetUsers(page, limit, search)
	if err != nil {
		http.Error(w, "Error retrieving users", http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(GetUsersResponse{
		Users: users,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}
