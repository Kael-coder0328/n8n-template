package lemonsqueezy

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CustomerResponse represents the response from the Lemon Squeezy API for customers
type CustomerResponse struct {
	Data CustomerData `json:"data"`
}

// CustomerData represents a single customer in the API response
type CustomerData struct {
	ID         string             `json:"id"`
	Type       string             `json:"type"`
	Attributes CustomerAttributes `json:"attributes"`
}

// CustomerAttributes represents the attributes of a customer
type CustomerAttributes struct {
	StoreID        int         `json:"store_id"`
	Name           string      `json:"name"`
	Email          string      `json:"email"`
	Status         string      `json:"status"`
	City           string      `json:"city"`
	Region         string      `json:"region"`
	Country        string      `json:"country"`
	TotalSpent     int         `json:"total_spent"`
	OrderCount     int         `json:"order_count"`
	CustomerPortal CustomerURL `json:"urls"`
	CreatedAt      string      `json:"created_at"`
	UpdatedAt      string      `json:"updated_at"`
}

// CustomerURL represents the URLs associated with a customer
type CustomerURL struct {
	CustomerPortal string `json:"customer_portal"`
}

// GetCustomer retrieves a specific customer
func (c *Client) GetCustomer(customerID string) (*CustomerResponse, error) {
	resp, err := c.doRequest(http.MethodGet, fmt.Sprintf("/customers/%s", customerID), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch customer: %d", resp.StatusCode)
	}

	var result CustomerResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}
