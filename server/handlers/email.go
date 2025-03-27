package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type PlunkEmailRequest struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

// AdminEmailRequest represents the request structure for admin to send an email
type AdminEmailRequest struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

func sendPasswordResetEmail(email, resetLink string) error {
	plunkAPIKey := os.Getenv("PLUNK_SECRET_API_KEY")
	if plunkAPIKey == "" {
		return fmt.Errorf("PLUNK_SECRET_API_KEY not set")
	}

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
				<h2>Reset Your Password</h2>
				<p>We received a request to reset your password. Click the button below to create a new password:</p>
				
				<a href="%s" class="button">Reset Password</a>
				
				<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
				<p>%s</p>
				
				<div class="footer">
					<p>This link will expire in 1 hour for security reasons.</p>
					<p>If you didn't request this password reset, you can safely ignore this email.</p>
				</div>
			</div>
		</body>
		</html>
	`, resetLink, resetLink)

	emailReq := PlunkEmailRequest{
		To:      email,
		Subject: "Reset Your Password",
		Body:    htmlBody,
	}

	jsonData, err := json.Marshal(emailReq)
	if err != nil {
		return fmt.Errorf("error marshaling email request: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.useplunk.com/v1/send", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+plunkAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error sending email: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error response from Plunk API: %d", resp.StatusCode)
	}

	return nil
}

// AdminSendEmailHandler handles the request to send an email from admin to a user
func (h *Handler) AdminSendEmailHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	var req AdminEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.To == "" || req.Subject == "" || req.Body == "" {
		http.Error(w, "To, subject, and body are required", http.StatusBadRequest)
		return
	}

	// Send the email using Plunk API
	if err := sendAdminEmail(req); err != nil {
		http.Error(w, "Failed to send email: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Email sent successfully"})
}

// sendAdminEmail sends an email using the Plunk API
func sendAdminEmail(req AdminEmailRequest) error {
	plunkAPIKey := os.Getenv("PLUNK_SECRET_API_KEY")
	if plunkAPIKey == "" {
		return fmt.Errorf("PLUNK_SECRET_API_KEY not set")
	}

	// Create the email payload
	emailPayload := map[string]interface{}{
		"to":      req.To,
		"subject": req.Subject,
		"body":    req.Body,
		"type":    "html", // Explicitly set the type to HTML
	}

	jsonData, err := json.Marshal(emailPayload)
	if err != nil {
		return fmt.Errorf("error marshaling email request: %v", err)
	}

	log.Printf("Sending email payload: %s", string(jsonData))

	httpReq, err := http.NewRequest("POST", "https://api.useplunk.com/v1/send", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+plunkAPIKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("error sending email: %v", err)
	}
	defer resp.Body.Close()

	// Read and log the response body for debugging
	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("Plunk API response: %s", string(respBody))

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error response from Plunk API: %d - %s", resp.StatusCode, string(respBody))
	}

	return nil
}
