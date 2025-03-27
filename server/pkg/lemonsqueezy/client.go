package lemonsqueezy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const (
	baseURL = "https://api.lemonsqueezy.com/v1"
)

// Client represents a Lemon Squeezy API client
type Client struct {
	apiKey string
	client *http.Client
}

// NewClient creates a new Lemon Squeezy API client
func NewClient() *Client {
	return &Client{
		apiKey: os.Getenv("LEMON_SQUEEZY_API_KEY"),
		client: &http.Client{},
	}
}

// doRequest performs an HTTP request to the Lemon Squeezy API
func (c *Client) doRequest(method, path string, body interface{}) (*http.Response, error) {
	url := fmt.Sprintf("%s%s", baseURL, path)

	var req *http.Request
	var jsonBody []byte
	var err error
	var buf *bytes.Buffer
	if body != nil {
		jsonBody, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
		buf = bytes.NewBuffer(jsonBody)
	} else {
		buf = bytes.NewBuffer(nil)
	}
	req, err = http.NewRequest(method, url, buf)

	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	return c.client.Do(req)
}

// GetProducts retrieves all products for a store
func (c *Client) GetProducts(storeID string) (*ProductResponse, error) {
	if storeID == "" {
		storeID = os.Getenv("LEMON_SQUEEZY_STORE_ID")
	}
	if storeID == "" {
		return nil, fmt.Errorf("store ID is required")
	}

	resp, err := c.doRequest(http.MethodGet, fmt.Sprintf("/products?filter[store_id]=%s", storeID), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch products: %d", resp.StatusCode)
	}

	var result ProductResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

// GetProduct retrieves a specific product
func (c *Client) GetProduct(productID string) (*ProductResponse, error) {
	resp, err := c.doRequest(http.MethodGet, fmt.Sprintf("/products/%s", productID), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result ProductResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

// GetVariants retrieves all variants for a product
func (c *Client) GetVariants(productID string) (*VariantResponse, error) {
	resp, err := c.doRequest(http.MethodGet, fmt.Sprintf("/variants?filter[product_id]=%s", productID), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result VariantResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

// CheckoutResponse represents the response from creating a checkout
type CheckoutResponse struct {
	Data struct {
		Type       string `json:"type"`
		ID         string `json:"id"`
		Attributes struct {
			StoreID   int    `json:"store_id"`
			VariantID int    `json:"variant_id"`
			URL       string `json:"url"`
		} `json:"attributes"`
	} `json:"data"`
}

// CheckoutOptions represents the options for customizing the checkout
type CheckoutOptions struct {
	ButtonColor string `json:"button_color,omitempty"`
}

// ProductOptions represents the options for the product in checkout
type ProductOptions struct {
	EnabledVariants []int `json:"enabled_variants,omitempty"`
}

// CheckoutData represents additional data for the checkout
type CheckoutData struct {
	DiscountCode string                 `json:"discount_code,omitempty"`
	Custom       map[string]interface{} `json:"custom,omitempty"`
}

// CreateCheckout creates a new checkout
func (c *Client) CreateCheckout(storeID string, variantID string, options map[string]interface{}) (*CheckoutResponse, error) {
	// Prepare checkout data
	checkoutData := map[string]interface{}{}
	if email, ok := options["email"].(string); ok && email != "" {
		checkoutData["email"] = email
	}
	if customData, ok := options["checkout_data"].(CheckoutData); ok {
		checkoutData["custom"] = customData.Custom
	}

	body := map[string]interface{}{
		"data": map[string]interface{}{
			"type": "checkouts",
			"attributes": map[string]interface{}{
				"checkout_data": checkoutData,
			},
			"relationships": map[string]interface{}{
				"store": map[string]interface{}{
					"data": map[string]interface{}{
						"type": "stores",
						"id":   storeID,
					},
				},
				"variant": map[string]interface{}{
					"data": map[string]interface{}{
						"type": "variants",
						"id":   variantID,
					},
				},
			},
		},
	}

	// Add optional fields if provided
	attributes := body["data"].(map[string]interface{})["attributes"].(map[string]interface{})

	if customPrice, ok := options["custom_price"].(int); ok {
		attributes["custom_price"] = customPrice
	}
	if productOptions, ok := options["product_options"].(ProductOptions); ok {
		attributes["product_options"] = productOptions
	}
	if checkoutOptions, ok := options["checkout_options"].(CheckoutOptions); ok {
		attributes["checkout_options"] = checkoutOptions
	}
	if expiresAt, ok := options["expires_at"].(string); ok {
		attributes["expires_at"] = expiresAt
	}
	if preview, ok := options["preview"].(bool); ok {
		attributes["preview"] = preview
	}

	resp, err := c.doRequest(http.MethodPost, "/checkouts", body)
	if err != nil {
		return nil, fmt.Errorf("failed to make checkout request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create checkout: status=%d body=%s", resp.StatusCode, string(respBody))
	}

	// Create a new buffer with the response body for json.Decoder
	bodyBuffer := bytes.NewBuffer(respBody)

	var result CheckoutResponse
	if err := json.NewDecoder(bodyBuffer).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &result, nil
}
