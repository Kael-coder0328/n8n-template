package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
)

// ContactHandler handles requests related to contact form submissions
type ContactHandler struct{}

// ContactFormRequest represents the data submitted from the contact form
type ContactFormRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

// NewContactHandler creates a new instance of ContactHandler
func NewContactHandler() *ContactHandler {
	return &ContactHandler{}
}

// SendContactEmail handles the contact form submission and sends an email to the admin
func (h *ContactHandler) SendContactEmail(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	var req ContactFormRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ContactHandler] Error decoding request body: %v", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Message == "" {
		http.Error(w, "Name, email, and message are required", http.StatusBadRequest)
		return
	}

	// Get admin email from environment variables
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		log.Println("[ContactHandler] Admin email not configured")
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Set default subject if empty
	subject := "Contact Form Submission"
	if req.Subject != "" {
		subject = req.Subject
	}

	// Prepare email content
	emailContent := `
<h1>New Contact Form Submission</h1>
<p><strong>From:</strong> ` + req.Name + ` (` + req.Email + `)</p>
<p><strong>Subject:</strong> ` + subject + `</p>
<p><strong>Message:</strong></p>
<p>` + req.Message + `</p>
`

	// Create email request for Plunk API
	emailReq := map[string]interface{}{
		"to":      adminEmail,
		"subject": "Contact Form: " + subject,
		"body":    emailContent,
		"reply":   req.Email, // Set reply-to to the contact form submitter's email
	}

	// Send email using Plunk API
	jsonData, err := json.Marshal(emailReq)
	if err != nil {
		log.Printf("[ContactHandler] Error marshaling email request: %v", err)
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}

	plunkAPIKey := os.Getenv("PLUNK_SECRET_API_KEY")
	if plunkAPIKey == "" {
		log.Printf("[ContactHandler] PLUNK_SECRET_API_KEY not set")
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}

	// Create HTTP request to Plunk API
	plunkReq, err := http.NewRequest("POST", "https://api.useplunk.com/v1/send", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("[ContactHandler] Error creating request: %v", err)
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}

	// Set headers
	plunkReq.Header.Set("Content-Type", "application/json")
	plunkReq.Header.Set("Authorization", "Bearer "+plunkAPIKey)

	// Add reply-to header via Plunk API custom headers
	// Note: Plunk doesn't directly support reply-to in their basic API
	// Consider adding custom headers if Plunk supports it in the future

	// Send request
	client := &http.Client{}
	resp, err := client.Do(plunkReq)
	if err != nil {
		log.Printf("[ContactHandler] Error sending email: %v", err)
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read and log the response body for debugging
	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("[ContactHandler] Plunk API response: %s", string(respBody))

	// Check response
	if resp.StatusCode != http.StatusOK {
		log.Printf("[ContactHandler] Error response from Plunk API: %d - %s", resp.StatusCode, string(respBody))
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Email sent successfully",
	})
}
